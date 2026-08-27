import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';
import { SocketGateway } from '../../infrastructure/socket/socket.gateway';
import { TicketWorkflowService } from '../services/ticket-workflow.service';
export declare class CreateCommentUseCase {
    private readonly commentRepository;
    private readonly socketGateway;
    private readonly ticketWorkflowService;
    constructor(commentRepository: ICommentRepository, socketGateway: SocketGateway, ticketWorkflowService: TicketWorkflowService);
    execute(data: {
        content: string;
        userId: string;
        ticketId: string;
    }): Promise<Comment>;
}
