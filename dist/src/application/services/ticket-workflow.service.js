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
exports.TicketWorkflowService = void 0;
const common_1 = require("@nestjs/common");
const ticket_repository_interface_1 = require("../../domain/repositories/ticket.repository.interface");
const change_ticket_state_use_case_1 = require("../use-cases/change-ticket-state.use-case");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let TicketWorkflowService = class TicketWorkflowService {
    ticketRepository;
    changeTicketStateUseCase;
    prisma;
    constructor(ticketRepository, changeTicketStateUseCase, prisma) {
        this.ticketRepository = ticketRepository;
        this.changeTicketStateUseCase = changeTicketStateUseCase;
        this.prisma = prisma;
    }
    async getStateIdByName(name) {
        const state = await this.prisma.workflowState.findFirst({
            where: { name },
        });
        return state?.id ?? null;
    }
    async getCurrentStateName(ticketId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket)
            return null;
        const state = await this.prisma.workflowState.findUnique({
            where: { id: ticket.workflowStateId },
        });
        return state?.name ?? null;
    }
    async transitionToStateName(ticketId, targetName, userId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket)
            return false;
        const targetId = await this.getStateIdByName(targetName);
        if (!targetId || ticket.workflowStateId === targetId)
            return false;
        const currentName = (await this.getCurrentStateName(ticketId))?.toUpperCase();
        if (currentName === 'CERRADO')
            return false;
        await this.changeTicketStateUseCase.execute(ticketId, targetId, userId);
        return true;
    }
    isOkFinMessage(content) {
        const normalized = content.trim().toLowerCase();
        return normalized === 'ok fin' || normalized === 'okfin' || normalized.startsWith('ok fin ');
    }
};
exports.TicketWorkflowService = TicketWorkflowService;
exports.TicketWorkflowService = TicketWorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.ITicketRepository)),
    __metadata("design:paramtypes", [Object, change_ticket_state_use_case_1.ChangeTicketStateUseCase,
        prisma_service_1.PrismaService])
], TicketWorkflowService);
//# sourceMappingURL=ticket-workflow.service.js.map