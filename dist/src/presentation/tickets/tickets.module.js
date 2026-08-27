"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsModule = void 0;
const common_1 = require("@nestjs/common");
const tickets_controller_1 = require("./tickets.controller");
const create_ticket_use_case_1 = require("../../application/use-cases/create-ticket.use-case");
const draft_smart_document_use_case_1 = require("../../application/use-cases/draft-smart-document.use-case");
const save_smart_document_use_case_1 = require("../../application/use-cases/save-smart-document.use-case");
const open_ticket_use_case_1 = require("../../application/use-cases/open-ticket.use-case");
const close_ticket_use_case_1 = require("../../application/use-cases/close-ticket.use-case");
const ticket_workflow_service_1 = require("../../application/services/ticket-workflow.service");
const change_ticket_state_use_case_1 = require("../../application/use-cases/change-ticket-state.use-case");
const upload_document_use_case_1 = require("../../application/use-cases/upload-document.use-case");
const get_ticket_documents_use_case_1 = require("../../application/use-cases/get-ticket-documents.use-case");
const create_comment_use_case_1 = require("../../application/use-cases/create-comment.use-case");
const get_ticket_comments_use_case_1 = require("../../application/use-cases/get-ticket-comments.use-case");
const generate_document_use_case_1 = require("../../application/use-cases/generate-document.use-case");
const summarize_ticket_conversation_use_case_1 = require("../../application/use-cases/summarize-ticket-conversation.use-case");
const prisma_ticket_repository_1 = require("../../infrastructure/repositories/prisma-ticket.repository");
const prisma_ticket_history_repository_1 = require("../../infrastructure/repositories/prisma-ticket-history.repository");
const prisma_document_repository_1 = require("../../infrastructure/repositories/prisma-document.repository");
const prisma_comment_repository_1 = require("../../infrastructure/repositories/prisma-comment.repository");
const ticket_repository_interface_1 = require("../../domain/repositories/ticket.repository.interface");
const ticket_history_repository_interface_1 = require("../../domain/repositories/ticket-history.repository.interface");
const document_repository_interface_1 = require("../../domain/repositories/document.repository.interface");
const comment_repository_interface_1 = require("../../domain/repositories/comment.repository.interface");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const ai_module_1 = require("../../infrastructure/ai/ai.module");
const ocr_module_1 = require("../../infrastructure/ocr/ocr.module");
const audit_module_1 = require("../../infrastructure/audit/audit.module");
const predictive_module_1 = require("../../infrastructure/predictive/predictive.module");
const cloudinary_service_1 = require("../../infrastructure/documents/cloudinary.service");
const semantic_search_service_1 = require("../../infrastructure/search/semantic-search.service");
let TicketsModule = class TicketsModule {
};
exports.TicketsModule = TicketsModule;
exports.TicketsModule = TicketsModule = __decorate([
    (0, common_1.Module)({
        imports: [ai_module_1.AiModule, ocr_module_1.OcrModule, audit_module_1.AuditModule, predictive_module_1.PredictiveModule],
        controllers: [tickets_controller_1.TicketsController],
        providers: [
            prisma_service_1.PrismaService,
            cloudinary_service_1.CloudinaryService,
            semantic_search_service_1.SemanticSearchService,
            create_ticket_use_case_1.CreateTicketUseCase,
            change_ticket_state_use_case_1.ChangeTicketStateUseCase,
            open_ticket_use_case_1.OpenTicketUseCase,
            close_ticket_use_case_1.CloseTicketUseCase,
            ticket_workflow_service_1.TicketWorkflowService,
            draft_smart_document_use_case_1.DraftSmartDocumentUseCase,
            save_smart_document_use_case_1.SaveSmartDocumentUseCase,
            upload_document_use_case_1.UploadDocumentUseCase,
            get_ticket_documents_use_case_1.GetTicketDocumentsUseCase,
            create_comment_use_case_1.CreateCommentUseCase,
            get_ticket_comments_use_case_1.GetTicketCommentsUseCase,
            generate_document_use_case_1.GenerateDocumentUseCase,
            summarize_ticket_conversation_use_case_1.SummarizeTicketConversationUseCase,
            semantic_search_service_1.SemanticSearchService,
            {
                provide: ticket_repository_interface_1.ITicketRepository,
                useClass: prisma_ticket_repository_1.PrismaTicketRepository,
            },
            {
                provide: ticket_history_repository_interface_1.ITicketHistoryRepository,
                useClass: prisma_ticket_history_repository_1.PrismaTicketHistoryRepository,
            },
            {
                provide: document_repository_interface_1.IDocumentRepository,
                useClass: prisma_document_repository_1.PrismaDocumentRepository,
            },
            {
                provide: comment_repository_interface_1.ICommentRepository,
                useClass: prisma_comment_repository_1.PrismaCommentRepository,
            },
        ],
        exports: [create_ticket_use_case_1.CreateTicketUseCase, change_ticket_state_use_case_1.ChangeTicketStateUseCase, upload_document_use_case_1.UploadDocumentUseCase, get_ticket_documents_use_case_1.GetTicketDocumentsUseCase, create_comment_use_case_1.CreateCommentUseCase, get_ticket_comments_use_case_1.GetTicketCommentsUseCase, generate_document_use_case_1.GenerateDocumentUseCase, summarize_ticket_conversation_use_case_1.SummarizeTicketConversationUseCase],
    })
], TicketsModule);
//# sourceMappingURL=tickets.module.js.map