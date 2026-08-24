import { Inject, Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { ChangeTicketStateUseCase } from '../use-cases/change-ticket-state.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export type WorkflowStateName = 'NUEVO' | 'EN_PROCESO' | 'COMPLETADO' | 'CERRADO';

@Injectable()
export class TicketWorkflowService {
  constructor(
    @Inject(ITicketRepository)
    private readonly ticketRepository: ITicketRepository,
    private readonly changeTicketStateUseCase: ChangeTicketStateUseCase,
    private readonly prisma: PrismaService,
  ) {}

  async getStateIdByName(name: WorkflowStateName): Promise<string | null> {
    const state = await this.prisma.workflowState.findFirst({
      where: { name },
    });
    return state?.id ?? null;
  }

  async getCurrentStateName(ticketId: string): Promise<string | null> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) return null;

    const state = await this.prisma.workflowState.findUnique({
      where: { id: ticket.workflowStateId },
    });
    return state?.name ?? null;
  }

  async transitionToStateName(
    ticketId: string,
    targetName: WorkflowStateName,
    userId: string,
  ): Promise<boolean> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) return false;

    const targetId = await this.getStateIdByName(targetName);
    if (!targetId || ticket.workflowStateId === targetId) return false;

    const currentName = (await this.getCurrentStateName(ticketId))?.toUpperCase();
    if (currentName === 'CERRADO') return false;

    await this.changeTicketStateUseCase.execute(ticketId, targetId, userId);
    return true;
  }

  isOkFinMessage(content: string): boolean {
    const normalized = content.trim().toLowerCase();
    return normalized === 'ok fin' || normalized === 'okfin' || normalized.startsWith('ok fin ');
  }
}
