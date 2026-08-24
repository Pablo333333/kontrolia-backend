import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

@Injectable()
export class OverdueReminderService implements OnModuleInit {
  private readonly logger = new Logger(OverdueReminderService.name);
  private readonly notifiedApproaching = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  onModuleInit() {
    this.checkOverdueAndPending().catch(err =>
      this.logger.error(`Initial overdue check failed: ${err.message}`),
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyCheck() {
    await this.checkOverdueAndPending();
  }

  async checkOverdueAndPending(): Promise<{ overdue: number; pending: number; approaching: number }> {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const closedStates = await this.prisma.workflowState.findMany({
      where: { name: { in: ['COMPLETADO', 'CERRADO', 'CANCELADO'] } },
      select: { id: true },
    });
    const closedIds = closedStates.map(s => s.id);

    const overdueTickets = await this.prisma.ticket.findMany({
      where: {
        isArchived: false,
        fechaLimite: { lt: now },
        workflowStateId: { notIn: closedIds },
      },
      include: {
        user: { select: { id: true } },
        destinatario: { select: { id: true } },
      },
    });

    const approachingTickets = await this.prisma.ticket.findMany({
      where: {
        isArchived: false,
        fechaLimite: { gte: now, lte: in24h },
        workflowStateId: { notIn: closedIds },
        priority: { in: ['URGENTE', 'MEDIA'] },
      },
      include: {
        destinatario: { select: { id: true } },
        user: { select: { id: true } },
      },
    });

    const pendingTickets = await this.prisma.ticket.findMany({
      where: {
        isArchived: false,
        workflowStateId: {
          in: (
            await this.prisma.workflowState.findMany({
              where: { name: { in: ['NUEVO', 'EN_PROCESO'] } },
              select: { id: true },
            })
          ).map(s => s.id),
        },
      },
    });

    for (const ticket of overdueTickets) {
      const targetUserId = ticket.destinatarioId || ticket.userId;
      await this.notificationService.notifyOverdue(targetUserId, ticket.title, ticket.id);
    }

    for (const ticket of approachingTickets) {
      const key = `approach:${ticket.id}`;
      if (this.notifiedApproaching.has(key)) continue;
      const targetUserId = ticket.destinatarioId || ticket.userId;
      const hoursLeft = Math.max(
        1,
        Math.ceil((new Date(ticket.fechaLimite!).getTime() - now.getTime()) / (1000 * 60 * 60)),
      );
      await this.notificationService.notifyApproachingDeadline(
        targetUserId,
        ticket.title,
        ticket.id,
        hoursLeft,
      );
      this.notifiedApproaching.add(key);
    }

    this.logger.log(
      `Reminders: overdue=${overdueTickets.length} approaching=${approachingTickets.length} pending=${pendingTickets.length}`,
    );

    return {
      overdue: overdueTickets.length,
      pending: pendingTickets.length,
      approaching: approachingTickets.length,
    };
  }
}
