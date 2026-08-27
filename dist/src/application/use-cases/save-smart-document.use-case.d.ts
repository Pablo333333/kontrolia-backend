import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { CreateCommentUseCase } from './create-comment.use-case';
import { SaveSmartDocumentDto } from '../dtos/smart-document.dto';
export declare class SaveSmartDocumentUseCase {
    private readonly ticketRepository;
    private readonly createCommentUseCase;
    constructor(ticketRepository: ITicketRepository, createCommentUseCase: CreateCommentUseCase);
    execute(ticketId: string, dto: SaveSmartDocumentDto, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
