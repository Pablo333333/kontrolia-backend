import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class GenerateDocumentUseCase {
    private readonly ticketRepository;
    private readonly prisma;
    constructor(ticketRepository: ITicketRepository, prisma: PrismaService);
    execute(ticketId: string): Promise<Buffer>;
}
