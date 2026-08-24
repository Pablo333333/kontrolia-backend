import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ITicketHistoryRepository } from '../../domain/repositories/ticket-history.repository.interface';
import { TicketHistory } from '../../domain/entities/ticket-history.entity';

@Injectable()
export class PrismaTicketHistoryRepository implements ITicketHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(history: TicketHistory): Promise<TicketHistory> {
    const created = await this.prisma.ticketHistory.create({
      data: {
        ticketId: history.ticketId,
        oldStateId: history.oldStateId,
        newStateId: history.newStateId,
        userId: history.userId,
      },
    });

    return new TicketHistory(created);
  }

  async findByTicketId(ticketId: string): Promise<TicketHistory[]> {
    const history = await this.prisma.ticketHistory.findMany({
      where: { ticketId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    const stateIds = [
      ...new Set(
        history.flatMap(h => [h.oldStateId, h.newStateId].filter(Boolean) as string[]),
      ),
    ];

    const states = stateIds.length
      ? await this.prisma.workflowState.findMany({ where: { id: { in: stateIds } } })
      : [];

    const stateById = Object.fromEntries(states.map(s => [s.id, s.name]));

    return history.map((h) => new TicketHistory({
      ...h,
      oldStateName: h.oldStateId ? stateById[h.oldStateId] : undefined,
      newStateName: stateById[h.newStateId],
      userName: h.user?.name ?? h.user?.email ?? undefined,
    }));
  }
}
