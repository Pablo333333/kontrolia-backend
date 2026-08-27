import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { TicketWorkflowService } from '../services/ticket-workflow.service';
export declare class CloseTicketUseCase {
    private readonly ticketRepository;
    private readonly ticketWorkflowService;
    constructor(ticketRepository: ITicketRepository, ticketWorkflowService: TicketWorkflowService);
    execute(ticketId: string, userId: string): Promise<{
        transitioned: boolean;
    }>;
}
