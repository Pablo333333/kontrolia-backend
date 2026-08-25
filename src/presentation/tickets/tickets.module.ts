import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { CreateTicketUseCase } from '../../application/use-cases/create-ticket.use-case';
import { DraftSmartDocumentUseCase } from '../../application/use-cases/draft-smart-document.use-case';
import { SaveSmartDocumentUseCase } from '../../application/use-cases/save-smart-document.use-case';
import { OpenTicketUseCase } from '../../application/use-cases/open-ticket.use-case';
import { CloseTicketUseCase } from '../../application/use-cases/close-ticket.use-case';
import { TicketWorkflowService } from '../../application/services/ticket-workflow.service';
import { ChangeTicketStateUseCase } from '../../application/use-cases/change-ticket-state.use-case';
import { UploadDocumentUseCase } from '../../application/use-cases/upload-document.use-case';
import { GetTicketDocumentsUseCase } from '../../application/use-cases/get-ticket-documents.use-case';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { GetTicketCommentsUseCase } from '../../application/use-cases/get-ticket-comments.use-case';
import { GenerateDocumentUseCase } from '../../application/use-cases/generate-document.use-case';
import { SummarizeTicketConversationUseCase } from '../../application/use-cases/summarize-ticket-conversation.use-case';
import { PrismaTicketRepository } from '../../infrastructure/repositories/prisma-ticket.repository';
import { PrismaTicketHistoryRepository } from '../../infrastructure/repositories/prisma-ticket-history.repository';
import { PrismaDocumentRepository } from '../../infrastructure/repositories/prisma-document.repository';
import { PrismaCommentRepository } from '../../infrastructure/repositories/prisma-comment.repository';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { ITicketHistoryRepository } from '../../domain/repositories/ticket-history.repository.interface';
import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AiModule } from '../../infrastructure/ai/ai.module';
import { OcrModule } from '../../infrastructure/ocr/ocr.module';
import { AuditModule } from '../../infrastructure/audit/audit.module';
import { PredictiveModule } from '../../infrastructure/predictive/predictive.module';
import { CloudinaryService } from '../../infrastructure/documents/cloudinary.service';
import { SemanticSearchService } from '../../infrastructure/search/semantic-search.service';

@Module({
  imports: [AiModule, OcrModule, AuditModule, PredictiveModule],
  controllers: [TicketsController],
  providers: [
    PrismaService,
    CloudinaryService,
    SemanticSearchService,
    CreateTicketUseCase,
    ChangeTicketStateUseCase,
    OpenTicketUseCase,
    CloseTicketUseCase,
    TicketWorkflowService,
    DraftSmartDocumentUseCase,
    SaveSmartDocumentUseCase,
    UploadDocumentUseCase,
    GetTicketDocumentsUseCase,
    CreateCommentUseCase,
    GetTicketCommentsUseCase,
    GenerateDocumentUseCase,
    SummarizeTicketConversationUseCase,
    SemanticSearchService,
    {
      provide: ITicketRepository,
      useClass: PrismaTicketRepository,
    },
    {
      provide: ITicketHistoryRepository,
      useClass: PrismaTicketHistoryRepository,
    },
    {
      provide: IDocumentRepository,
      useClass: PrismaDocumentRepository,
    },
    {
      provide: ICommentRepository,
      useClass: PrismaCommentRepository,
    },
  ],
  exports: [CreateTicketUseCase, ChangeTicketStateUseCase, UploadDocumentUseCase, GetTicketDocumentsUseCase, CreateCommentUseCase, GetTicketCommentsUseCase, GenerateDocumentUseCase, SummarizeTicketConversationUseCase],
})
export class TicketsModule {}
