import type { Response } from 'express';
import { CreateTicketUseCase } from '../../application/use-cases/create-ticket.use-case';
import { ChangeTicketStateUseCase } from '../../application/use-cases/change-ticket-state.use-case';
import { OpenTicketUseCase } from '../../application/use-cases/open-ticket.use-case';
import { CloseTicketUseCase } from '../../application/use-cases/close-ticket.use-case';
import { UploadDocumentUseCase } from '../../application/use-cases/upload-document.use-case';
import { GetTicketDocumentsUseCase } from '../../application/use-cases/get-ticket-documents.use-case';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { GetTicketCommentsUseCase } from '../../application/use-cases/get-ticket-comments.use-case';
import { GenerateDocumentUseCase } from '../../application/use-cases/generate-document.use-case';
import { SummarizeTicketConversationUseCase } from '../../application/use-cases/summarize-ticket-conversation.use-case';
import { DraftSmartDocumentUseCase } from '../../application/use-cases/draft-smart-document.use-case';
import { SaveSmartDocumentUseCase } from '../../application/use-cases/save-smart-document.use-case';
import { DraftSmartDocumentDto, SaveSmartDocumentDto } from '../../application/dtos/smart-document.dto';
import { CreateTicketDto } from '../../application/dtos/create-ticket.dto';
import { ChangeTicketStatusDto } from '../../application/dtos/change-ticket-status.dto';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { ITicketHistoryRepository } from '../../domain/repositories/ticket-history.repository.interface';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OcrService } from '../../infrastructure/ocr/ocr.service';
import { PredictiveService } from '../../infrastructure/predictive/predictive.service';
import { CloudinaryService } from '../../infrastructure/documents/cloudinary.service';
import { SemanticSearchService } from '../../infrastructure/search/semantic-search.service';
export declare class TicketsController {
    private readonly createTicketUseCase;
    private readonly changeTicketStateUseCase;
    private readonly openTicketUseCase;
    private readonly closeTicketUseCase;
    private readonly uploadDocumentUseCase;
    private readonly getTicketDocumentsUseCase;
    private readonly createCommentUseCase;
    private readonly getTicketCommentsUseCase;
    private readonly generateDocumentUseCase;
    private readonly draftSmartDocumentUseCase;
    private readonly saveSmartDocumentUseCase;
    private readonly summarizeTicketConversationUseCase;
    private readonly prisma;
    private readonly ocrService;
    private readonly predictiveService;
    private readonly cloudinaryService;
    private readonly semanticSearchService;
    private readonly ticketRepository;
    private readonly ticketHistoryRepository;
    constructor(createTicketUseCase: CreateTicketUseCase, changeTicketStateUseCase: ChangeTicketStateUseCase, openTicketUseCase: OpenTicketUseCase, closeTicketUseCase: CloseTicketUseCase, uploadDocumentUseCase: UploadDocumentUseCase, getTicketDocumentsUseCase: GetTicketDocumentsUseCase, createCommentUseCase: CreateCommentUseCase, getTicketCommentsUseCase: GetTicketCommentsUseCase, generateDocumentUseCase: GenerateDocumentUseCase, draftSmartDocumentUseCase: DraftSmartDocumentUseCase, saveSmartDocumentUseCase: SaveSmartDocumentUseCase, summarizeTicketConversationUseCase: SummarizeTicketConversationUseCase, prisma: PrismaService, ocrService: OcrService, predictiveService: PredictiveService, cloudinaryService: CloudinaryService, semanticSearchService: SemanticSearchService, ticketRepository: ITicketRepository, ticketHistoryRepository: ITicketHistoryRepository);
    create(createTicketDto: CreateTicketDto, user: {
        userId: string;
    }, file?: Express.Multer.File): Promise<import("../../domain/entities/ticket.entity").Ticket>;
    draftSmartDocument(dto: DraftSmartDocumentDto): Promise<{
        content: string;
    }>;
    saveSmartDocument(id: string, dto: SaveSmartDocumentDto, user: {
        userId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    changeStatus(id: string, dto: ChangeTicketStatusDto, user: {
        userId: string;
    }): Promise<void>;
    findAll(categoryId?: string, subcategoryId?: string, workflowStateId?: string, priority?: string, messageType?: string, userId?: string, destinatarioId?: string, q?: string, includeArchived?: string, includeDocuments?: string, includeLastResponse?: string, limit?: string, offset?: string): Promise<import("../../domain/entities/ticket.entity").Ticket[]>;
    open(id: string, user: {
        userId: string;
    }): Promise<{
        transitioned: boolean;
    }>;
    close(id: string, user: {
        userId: string;
    }): Promise<{
        transitioned: boolean;
    }>;
    getStats(): Promise<any>;
    search(q?: string, mode?: string, includeArchived?: string, limit?: string): Promise<import("../../domain/entities/ticket.entity").Ticket[]>;
    findOne(id: string): Promise<import("../../domain/entities/ticket.entity").Ticket | null>;
    getHistory(id: string): Promise<import("../../domain/entities/ticket-history.entity").TicketHistory[]>;
    uploadFile(id: string, file: Express.Multer.File, user: {
        userId: string;
    }): Promise<import("../../domain/entities/document.entity").Document>;
    getDocuments(id: string): Promise<import("../../domain/entities/document.entity").Document[]>;
    createComment(id: string, content: string, user: {
        userId: string;
    }): Promise<import("../../domain/entities/comment.entity").Comment>;
    getComments(id: string): Promise<import("../../domain/entities/comment.entity").Comment[]>;
    summarize(id: string): Promise<{
        summary: string;
    }>;
    generatePdf(id: string, res: Response): Promise<void>;
    analyzeImage(file: Express.Multer.File): Promise<{
        error: string;
    } | {
        extractedText: string;
        tipo: string;
        prioridad: "URGENTE" | "MEDIA" | "BAJA";
        responsableSugerido?: string;
        resumen: string;
        titulo?: string;
        error?: undefined;
    }>;
}
