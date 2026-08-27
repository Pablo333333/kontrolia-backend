"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const create_ticket_use_case_1 = require("../../application/use-cases/create-ticket.use-case");
const change_ticket_state_use_case_1 = require("../../application/use-cases/change-ticket-state.use-case");
const open_ticket_use_case_1 = require("../../application/use-cases/open-ticket.use-case");
const close_ticket_use_case_1 = require("../../application/use-cases/close-ticket.use-case");
const upload_document_use_case_1 = require("../../application/use-cases/upload-document.use-case");
const get_ticket_documents_use_case_1 = require("../../application/use-cases/get-ticket-documents.use-case");
const create_comment_use_case_1 = require("../../application/use-cases/create-comment.use-case");
const get_ticket_comments_use_case_1 = require("../../application/use-cases/get-ticket-comments.use-case");
const generate_document_use_case_1 = require("../../application/use-cases/generate-document.use-case");
const summarize_ticket_conversation_use_case_1 = require("../../application/use-cases/summarize-ticket-conversation.use-case");
const draft_smart_document_use_case_1 = require("../../application/use-cases/draft-smart-document.use-case");
const save_smart_document_use_case_1 = require("../../application/use-cases/save-smart-document.use-case");
const smart_document_dto_1 = require("../../application/dtos/smart-document.dto");
const create_ticket_dto_1 = require("../../application/dtos/create-ticket.dto");
const change_ticket_status_dto_1 = require("../../application/dtos/change-ticket-status.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../infrastructure/auth/roles.guard");
const roles_decorator_1 = require("../../infrastructure/auth/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const ticket_repository_interface_1 = require("../../domain/repositories/ticket.repository.interface");
const ticket_history_repository_interface_1 = require("../../domain/repositories/ticket-history.repository.interface");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const ocr_service_1 = require("../../infrastructure/ocr/ocr.service");
const predictive_service_1 = require("../../infrastructure/predictive/predictive.service");
const cloudinary_service_1 = require("../../infrastructure/documents/cloudinary.service");
const semantic_search_service_1 = require("../../infrastructure/search/semantic-search.service");
let TicketsController = class TicketsController {
    createTicketUseCase;
    changeTicketStateUseCase;
    openTicketUseCase;
    closeTicketUseCase;
    uploadDocumentUseCase;
    getTicketDocumentsUseCase;
    createCommentUseCase;
    getTicketCommentsUseCase;
    generateDocumentUseCase;
    draftSmartDocumentUseCase;
    saveSmartDocumentUseCase;
    summarizeTicketConversationUseCase;
    prisma;
    ocrService;
    predictiveService;
    cloudinaryService;
    semanticSearchService;
    ticketRepository;
    ticketHistoryRepository;
    constructor(createTicketUseCase, changeTicketStateUseCase, openTicketUseCase, closeTicketUseCase, uploadDocumentUseCase, getTicketDocumentsUseCase, createCommentUseCase, getTicketCommentsUseCase, generateDocumentUseCase, draftSmartDocumentUseCase, saveSmartDocumentUseCase, summarizeTicketConversationUseCase, prisma, ocrService, predictiveService, cloudinaryService, semanticSearchService, ticketRepository, ticketHistoryRepository) {
        this.createTicketUseCase = createTicketUseCase;
        this.changeTicketStateUseCase = changeTicketStateUseCase;
        this.openTicketUseCase = openTicketUseCase;
        this.closeTicketUseCase = closeTicketUseCase;
        this.uploadDocumentUseCase = uploadDocumentUseCase;
        this.getTicketDocumentsUseCase = getTicketDocumentsUseCase;
        this.createCommentUseCase = createCommentUseCase;
        this.getTicketCommentsUseCase = getTicketCommentsUseCase;
        this.generateDocumentUseCase = generateDocumentUseCase;
        this.draftSmartDocumentUseCase = draftSmartDocumentUseCase;
        this.saveSmartDocumentUseCase = saveSmartDocumentUseCase;
        this.summarizeTicketConversationUseCase = summarizeTicketConversationUseCase;
        this.prisma = prisma;
        this.ocrService = ocrService;
        this.predictiveService = predictiveService;
        this.cloudinaryService = cloudinaryService;
        this.semanticSearchService = semanticSearchService;
        this.ticketRepository = ticketRepository;
        this.ticketHistoryRepository = ticketHistoryRepository;
    }
    async create(createTicketDto, user, file) {
        try {
            if (file) {
                console.log(`[Cloudinary] Archivo subido exitosamente: ${file.path}`);
            }
            return await this.createTicketUseCase.execute(createTicketDto, user.userId, file);
        }
        catch (error) {
            console.error('[Cloudinary Error] Fallo en la subida:', error);
            throw new common_1.InternalServerErrorException('El servicio de almacenamiento no está disponible');
        }
    }
    async draftSmartDocument(dto) {
        return this.draftSmartDocumentUseCase.execute(dto);
    }
    async saveSmartDocument(id, dto, user) {
        return this.saveSmartDocumentUseCase.execute(id, dto, user.userId);
    }
    async changeStatus(id, dto, user) {
        return this.changeTicketStateUseCase.execute(id, dto.newStateId, user.userId);
    }
    async findAll(categoryId, subcategoryId, workflowStateId, priority, messageType, userId, destinatarioId, q, includeArchived, includeDocuments, includeLastResponse, limit, offset) {
        return this.ticketRepository.findAll({
            categoryId,
            subcategoryId,
            workflowStateId,
            priority,
            messageType,
            userId,
            destinatarioId,
            q,
            includeArchived: includeArchived === 'true',
            includeDocuments: includeDocuments === 'true',
            includeLastResponse: includeLastResponse !== 'false',
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
        });
    }
    async open(id, user) {
        return this.openTicketUseCase.execute(id, user.userId);
    }
    async close(id, user) {
        return this.closeTicketUseCase.execute(id, user.userId);
    }
    async getStats() {
        return this.ticketRepository.getStats();
    }
    async search(q, mode, includeArchived, limit) {
        const query = (q || '').trim();
        if (!query)
            return [];
        if ((mode || 'semantic') === 'literal') {
            return this.ticketRepository.findAll({
                q: query,
                includeArchived: includeArchived === 'true',
                limit: limit ? Number(limit) : 50,
            });
        }
        return this.semanticSearchService.search(query, {
            includeArchived: includeArchived === 'true',
            limit: limit ? Number(limit) : 50,
        });
    }
    async findOne(id) {
        return this.ticketRepository.findById(id);
    }
    async getHistory(id) {
        return this.ticketHistoryRepository.findByTicketId(id);
    }
    async uploadFile(id, file, user) {
        try {
            console.log(`[Cloudinary] Archivo subido exitosamente: ${file.path}`);
            const existingDoc = await this.prisma.document.findFirst({
                where: {
                    ticketId: id,
                    name: file.originalname,
                    isLatest: true,
                },
            });
            let version = 1;
            if (existingDoc) {
                version = existingDoc.version + 1;
                await this.prisma.document.update({
                    where: { id: existingDoc.id },
                    data: { isLatest: false },
                });
            }
            let extractedText;
            if (file.mimetype?.startsWith('image/')) {
                extractedText = await this.ocrService.extractTextFromUrl(file.path);
                if (!extractedText?.trim()) {
                    extractedText = undefined;
                }
            }
            return this.uploadDocumentUseCase.execute({
                name: file.originalname,
                url: file.path,
                type: file.mimetype,
                userId: user.userId,
                ticketId: id,
                version,
                isLatest: true,
                extractedText,
            });
        }
        catch (error) {
            console.error('[Cloudinary Error] Fallo en la subida:', error);
            throw new common_1.InternalServerErrorException('El servicio de almacenamiento no está disponible');
        }
    }
    async getDocuments(id) {
        return this.getTicketDocumentsUseCase.execute(id);
    }
    async createComment(id, content, user) {
        return this.createCommentUseCase.execute({
            content,
            userId: user.userId,
            ticketId: id,
        });
    }
    async getComments(id) {
        return this.getTicketCommentsUseCase.execute(id);
    }
    async summarize(id) {
        return { summary: await this.summarizeTicketConversationUseCase.execute(id) };
    }
    async generatePdf(id, res) {
        const buffer = await this.generateDocumentUseCase.execute(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=ticket-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
    async analyzeImage(file) {
        try {
            const text = await this.ocrService.extractText(file.path);
            if (!text)
                return { error: 'No se pudo extraer texto de la imagen' };
            const suggestions = await this.predictiveService.analyzeDocumentText(text);
            return { ...suggestions, extractedText: text };
        }
        catch (error) {
            console.error('[Cloudinary Error] Fallo en la subida:', error);
            throw new common_1.InternalServerErrorException('El servicio de almacenamiento no está disponible');
        }
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR, client_1.Role.OPERARIO),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio', {
        storage: new cloudinary_service_1.CloudinaryService().getStorage('tickets/audio'),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ticket_dto_1.CreateTicketDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('smart-document/draft'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR, client_1.Role.OPERARIO),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [smart_document_dto_1.DraftSmartDocumentDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "draftSmartDocument", null);
__decorate([
    (0, common_1.Post)(':id/smart-document/save'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR, client_1.Role.OPERARIO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, smart_document_dto_1.SaveSmartDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "saveSmartDocument", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_ticket_status_dto_1.ChangeTicketStatusDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('categoryId')),
    __param(1, (0, common_1.Query)('subcategoryId')),
    __param(2, (0, common_1.Query)('workflowStateId')),
    __param(3, (0, common_1.Query)('priority')),
    __param(4, (0, common_1.Query)('messageType')),
    __param(5, (0, common_1.Query)('userId')),
    __param(6, (0, common_1.Query)('destinatarioId')),
    __param(7, (0, common_1.Query)('q')),
    __param(8, (0, common_1.Query)('includeArchived')),
    __param(9, (0, common_1.Query)('includeDocuments')),
    __param(10, (0, common_1.Query)('includeLastResponse')),
    __param(11, (0, common_1.Query)('limit')),
    __param(12, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':id/open'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR, client_1.Role.OPERARIO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "open", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR, client_1.Role.OPERARIO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "close", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('mode')),
    __param(2, (0, common_1.Query)('includeArchived')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', new cloudinary_service_1.CloudinaryService().getUploadOptions('tickets/documents'))),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(':id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "createComment", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)(':id/summarize'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR, client_1.Role.OPERARIO),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "summarize", null);
__decorate([
    (0, common_1.Get)(':id/generate-pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "generatePdf", null);
__decorate([
    (0, common_1.Post)('analyze-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: new cloudinary_service_1.CloudinaryService().getStorage('temp/ocr'),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "analyzeImage", null);
exports.TicketsController = TicketsController = __decorate([
    (0, common_1.Controller)('tickets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(17, (0, common_1.Inject)(ticket_repository_interface_1.ITicketRepository)),
    __param(18, (0, common_1.Inject)(ticket_history_repository_interface_1.ITicketHistoryRepository)),
    __metadata("design:paramtypes", [create_ticket_use_case_1.CreateTicketUseCase,
        change_ticket_state_use_case_1.ChangeTicketStateUseCase,
        open_ticket_use_case_1.OpenTicketUseCase,
        close_ticket_use_case_1.CloseTicketUseCase,
        upload_document_use_case_1.UploadDocumentUseCase,
        get_ticket_documents_use_case_1.GetTicketDocumentsUseCase,
        create_comment_use_case_1.CreateCommentUseCase,
        get_ticket_comments_use_case_1.GetTicketCommentsUseCase,
        generate_document_use_case_1.GenerateDocumentUseCase,
        draft_smart_document_use_case_1.DraftSmartDocumentUseCase,
        save_smart_document_use_case_1.SaveSmartDocumentUseCase,
        summarize_ticket_conversation_use_case_1.SummarizeTicketConversationUseCase,
        prisma_service_1.PrismaService,
        ocr_service_1.OcrService,
        predictive_service_1.PredictiveService,
        cloudinary_service_1.CloudinaryService,
        semantic_search_service_1.SemanticSearchService, Object, Object])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map