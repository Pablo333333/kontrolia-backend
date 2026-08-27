import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { ChangeTicketStateUseCase } from '../use-cases/change-ticket-state.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export type WorkflowStateName = 'NUEVO' | 'EN_PROCESO' | 'COMPLETADO' | 'CERRADO';
export declare class TicketWorkflowService {
    private readonly ticketRepository;
    private readonly changeTicketStateUseCase;
    private readonly prisma;
    constructor(ticketRepository: ITicketRepository, changeTicketStateUseCase: ChangeTicketStateUseCase, prisma: PrismaService);
    getStateIdByName(name: WorkflowStateName): Promise<string | null>;
    getCurrentStateName(ticketId: string): Promise<string | null>;
    transitionToStateName(ticketId: string, targetName: WorkflowStateName, userId: string): Promise<boolean>;
    isOkFinMessage(content: string): boolean;
}
