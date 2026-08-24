import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { TicketWorkflowService } from '../services/ticket-workflow.service';

@Injectable()
export class CloseTicketUseCase {
  constructor(
    @Inject(ITicketRepository)
    private readonly ticketRepository: ITicketRepository,
    private readonly ticketWorkflowService: TicketWorkflowService,
  ) {}

  async execute(ticketId: string, userId: string): Promise<{ transitioned: boolean }> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const transitioned = await this.ticketWorkflowService.transitionToStateName(
      ticketId,
      'CERRADO',
      userId,
    );
    return { transitioned };
  }
}
