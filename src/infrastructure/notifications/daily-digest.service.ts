import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

/**
 * Daily digest of pending response messages.
 * Default: every day at 08:00 America/Lima (configurable via DIGEST_CRON).
 */
@Injectable()
export class DailyDigestService {
  private readonly logger = new Logger(DailyDigestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly config: ConfigService,
  ) {}

  @Cron('0 8 * * *', {
    timeZone: 'America/Lima',
    name: 'daily-digest',
  })
  async handleDailyDigest() {
    if (this.config.get('DIGEST_ENABLED') === 'false') {
      this.logger.debug('Daily digest disabled via DIGEST_ENABLED=false');
      return;
    }
    await this.sendDigest();
  }

  async sendDigest(): Promise<{ recipients: number; pending: number }> {
    const closedStates = await this.prisma.workflowState.findMany({
      where: { name: { in: ['COMPLETADO', 'CERRADO', 'CANCELADO'] } },
      select: { id: true },
    });
    const closedIds = closedStates.map(s => s.id);
    const now = new Date();

    const pending = await this.prisma.ticket.findMany({
      where: {
        isArchived: false,
        workflowStateId: { notIn: closedIds },
      },
      include: {
        status: true,
        destinatario: { select: { id: true, email: true, name: true, phone: true } },
        user: { select: { id: true, name: true } },
        workGroup: { select: { id: true, name: true } },
      },
      orderBy: [{ fechaLimite: 'asc' }, { createdAt: 'desc' }],
    });

    if (pending.length === 0) {
      this.logger.log('Daily digest: no pending messages');
      return { recipients: 0, pending: 0 };
    }

    // Group by destinatario (or creator if no destinatario)
    const byUser = new Map<string, typeof pending>();
    for (const ticket of pending) {
      const targetId = ticket.destinatarioId || ticket.userId;
      const list = byUser.get(targetId) ?? [];
      list.push(ticket);
      byUser.set(targetId, list);
    }

    // Also send group-level digest to LEADs / ADMINs of each work group
    const groupLeads = await this.prisma.workGroupMember.findMany({
      where: { roleInGroup: 'LEAD' },
      select: { userId: true, workGroupId: true },
    });

    for (const [userId, tickets] of byUser.entries()) {
      const overdue = tickets.filter(t => t.fechaLimite && new Date(t.fechaLimite) < now);
      const lines = tickets.slice(0, 15).map(t => {
        const due = t.fechaLimite
          ? new Date(t.fechaLimite).toLocaleDateString('es-PE')
          : 'sin plazo';
        const status = t.status?.name ?? '?';
        return `• [${status}] ${t.title} (vence: ${due}) — de ${t.user?.name || 'N/D'}`;
      });

      const body = [
        `Resumen diario KONTROLIA — ${now.toLocaleDateString('es-PE')}`,
        ``,
        `Tienes ${tickets.length} mensaje(s) pendiente(s) de respuesta.`,
        overdue.length ? `De ellos, ${overdue.length} ya están vencidos.` : '',
        ``,
        ...lines,
        tickets.length > 15 ? `…y ${tickets.length - 15} más.` : '',
        ``,
        `Abre la app para dar seguimiento.`,
      ]
        .filter(Boolean)
        .join('\n');

      await this.notificationService.notifyUser({
        userId,
        title: 'Resumen diario de pendientes',
        body,
        data: { alertType: 'DAILY_DIGEST', pendingCount: tickets.length },
        channels: ['PUSH', 'EMAIL', 'WHATSAPP'],
      });
    }

    // Extra digest for group leads with all group pending
    for (const lead of groupLeads) {
      if (byUser.has(lead.userId)) continue; // already received personal digest
      const groupPending = pending.filter(t => t.workGroupId === lead.workGroupId);
      if (groupPending.length === 0) continue;

      const body = [
        `Resumen del grupo — ${now.toLocaleDateString('es-PE')}`,
        `${groupPending.length} mensaje(s) pendientes en tu grupo.`,
        ...groupPending.slice(0, 10).map(t => `• ${t.title}`),
      ].join('\n');

      await this.notificationService.notifyUser({
        userId: lead.userId,
        title: 'Resumen diario del grupo',
        body,
        data: { alertType: 'DAILY_DIGEST_GROUP' },
        channels: ['EMAIL', 'PUSH'],
      });
    }

    this.logger.log(`Daily digest sent to ${byUser.size} users (${pending.length} pending)`);
    return { recipients: byUser.size, pending: pending.length };
  }
}
