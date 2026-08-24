import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { CreateCommentUseCase } from './create-comment.use-case';
import { SaveSmartDocumentDto } from '../dtos/smart-document.dto';

@Injectable()
export class SaveSmartDocumentUseCase {
  constructor(
    @Inject(ITicketRepository)
    private readonly ticketRepository: ITicketRepository,
    private readonly createCommentUseCase: CreateCommentUseCase,
  ) {}

  async execute(ticketId: string, dto: SaveSmartDocumentDto, userId: string) {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const title = dto.title || ticket.title;

    await this.createCommentUseCase.execute({
      content: `[Documento Automático: ${title}]\n\n${dto.content}`,
      userId,
      ticketId,
    });

    return { success: true, message: 'Documento guardado en el hilo de comunicación' };
  }
}
