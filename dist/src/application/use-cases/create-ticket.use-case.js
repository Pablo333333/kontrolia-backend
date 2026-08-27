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
exports.CreateTicketUseCase = void 0;
const ticket_entity_1 = require("../../domain/entities/ticket.entity");
const ticket_repository_interface_1 = require("../../domain/repositories/ticket.repository.interface");
const ticket_history_repository_interface_1 = require("../../domain/repositories/ticket-history.repository.interface");
const ticket_history_entity_1 = require("../../domain/entities/ticket-history.entity");
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../../infrastructure/audit/audit.service");
const upload_document_use_case_1 = require("./upload-document.use-case");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const notification_service_1 = require("../../infrastructure/notifications/notification.service");
const resolve_subcategory_1 = require("../utils/resolve-subcategory");
let CreateTicketUseCase = class CreateTicketUseCase {
    ticketRepository;
    ticketHistoryRepository;
    auditService;
    uploadDocumentUseCase;
    prisma;
    notificationService;
    constructor(ticketRepository, ticketHistoryRepository, auditService, uploadDocumentUseCase, prisma, notificationService) {
        this.ticketRepository = ticketRepository;
        this.ticketHistoryRepository = ticketHistoryRepository;
        this.auditService = auditService;
        this.uploadDocumentUseCase = uploadDocumentUseCase;
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async execute(dto, userId, file) {
        const nuevoState = await this.prisma.workflowState.findFirst({
            where: { name: 'NUEVO' },
        });
        let parentTicketId;
        let rootTicketId;
        let isContinuation = false;
        let workGroupId;
        const creator = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { activeWorkGroupId: true },
        });
        workGroupId = creator?.activeWorkGroupId ?? undefined;
        if (dto.parentTicketId) {
            const parent = await this.ticketRepository.findById(dto.parentTicketId);
            if (parent) {
                parentTicketId = parent.id;
                rootTicketId = parent.rootTicketId ?? parent.id;
                isContinuation = true;
                if (parent.workGroupId) {
                    workGroupId = parent.workGroupId;
                }
            }
        }
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
            include: { subcategories: true },
        });
        const subcategoryId = (0, resolve_subcategory_1.resolveSubcategoryId)({
            subcategories: category?.subcategories ?? [],
            title: dto.title,
            messageType: dto.messageType,
            tramiteSubtype: dto.tramiteSubtype,
            explicitId: dto.subcategoryId,
        });
        const subcategory = subcategoryId
            ? category?.subcategories.find((s) => s.id === subcategoryId)
            : undefined;
        const title = (0, resolve_subcategory_1.composeCategoryTitle)(category?.name ?? 'Mensaje', subcategory?.name, dto.title);
        const ticket = new ticket_entity_1.Ticket({
            title,
            description: dto.description,
            latitude: dto.latitude,
            longitude: dto.longitude,
            locationLabel: dto.locationLabel,
            userId: userId,
            categoryId: dto.categoryId,
            subcategoryId,
            workflowStateId: nuevoState?.id ?? dto.workflowStateId,
            destinatarioId: dto.destinatarioId,
            messageType: dto.messageType,
            tramiteSubtype: dto.tramiteSubtype,
            responseUrgency: dto.responseUrgency,
            fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : undefined,
            priority: dto.priority ?? 'BAJA',
            parentTicketId,
            rootTicketId,
            isContinuation,
            workGroupId,
        });
        const createdTicket = await this.ticketRepository.create(ticket);
        if (!createdTicket.rootTicketId) {
            await this.ticketRepository.update(createdTicket.id, {
                rootTicketId: createdTicket.id,
            });
            createdTicket.rootTicketId = createdTicket.id;
        }
        if (createdTicket.workflowStateId) {
            await this.ticketHistoryRepository.create(new ticket_history_entity_1.TicketHistory({
                ticketId: createdTicket.id,
                oldStateId: null,
                newStateId: createdTicket.workflowStateId,
                userId,
            }));
        }
        if (file) {
            await this.uploadDocumentUseCase.execute({
                name: file.originalname,
                url: file.path,
                type: file.mimetype,
                userId: userId,
                ticketId: createdTicket.id,
            });
        }
        await this.auditService.logAction(createdTicket.id, 'TICKET', { ...dto, userId });
        if (dto.destinatarioId && dto.destinatarioId !== userId) {
            await this.notificationService.notifyNewMessage(dto.destinatarioId, title, createdTicket.id, dto.priority === 'URGENTE');
        }
        else if (!dto.destinatarioId && workGroupId) {
            const members = await this.prisma.workGroupMember.findMany({
                where: { workGroupId, userId: { not: userId } },
                select: { userId: true },
            });
            await this.notificationService.notifyUsers(members.map(m => m.userId), {
                title: dto.priority === 'URGENTE' ? 'Mensaje urgente al grupo' : 'Nuevo mensaje al grupo',
                body: title,
                data: { entityId: createdTicket.id, entityType: 'TICKET', alertType: 'NEW_MESSAGE' },
                channels: ['PUSH', 'EMAIL', 'WHATSAPP'],
            });
        }
        return createdTicket;
    }
};
exports.CreateTicketUseCase = CreateTicketUseCase;
exports.CreateTicketUseCase = CreateTicketUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.ITicketRepository)),
    __param(1, (0, common_1.Inject)(ticket_history_repository_interface_1.ITicketHistoryRepository)),
    __metadata("design:paramtypes", [Object, Object, audit_service_1.AuditService,
        upload_document_use_case_1.UploadDocumentUseCase,
        prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], CreateTicketUseCase);
//# sourceMappingURL=create-ticket.use-case.js.map