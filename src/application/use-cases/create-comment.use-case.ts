import { Injectable, Inject } from '@nestjs/common';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';
import { SocketGateway } from '../../infrastructure/socket/socket.gateway';
import { TicketWorkflowService } from '../services/ticket-workflow.service';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
    private readonly socketGateway: SocketGateway,
    private readonly ticketWorkflowService: TicketWorkflowService,
  ) {}

  async execute(data: { content: string; userId: string; ticketId: string }): Promise<Comment> {
    const comment = await this.commentRepository.create({
      content: data.content,
      userId: data.userId,
      ticketId: data.ticketId,
    });

    if (this.ticketWorkflowService.isOkFinMessage(data.content)) {
      await this.ticketWorkflowService.transitionToStateName(data.ticketId, 'CERRADO', data.userId);
    } else {
      const currentName = (await this.ticketWorkflowService.getCurrentStateName(data.ticketId))?.toUpperCase();
      if (currentName && !['CERRADO', 'COMPLETADO'].includes(currentName)) {
        await this.ticketWorkflowService.transitionToStateName(data.ticketId, 'COMPLETADO', data.userId);
      }
    }

    this.socketGateway.server.to(data.ticketId).emit('messageReceived', comment);

    return comment;
  }
}
