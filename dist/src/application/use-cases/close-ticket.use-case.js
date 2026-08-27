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
exports.CloseTicketUseCase = void 0;
const common_1 = require("@nestjs/common");
const ticket_repository_interface_1 = require("../../domain/repositories/ticket.repository.interface");
const ticket_workflow_service_1 = require("../services/ticket-workflow.service");
let CloseTicketUseCase = class CloseTicketUseCase {
    ticketRepository;
    ticketWorkflowService;
    constructor(ticketRepository, ticketWorkflowService) {
        this.ticketRepository = ticketRepository;
        this.ticketWorkflowService = ticketWorkflowService;
    }
    async execute(ticketId, userId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        const transitioned = await this.ticketWorkflowService.transitionToStateName(ticketId, 'CERRADO', userId);
        return { transitioned };
    }
};
exports.CloseTicketUseCase = CloseTicketUseCase;
exports.CloseTicketUseCase = CloseTicketUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.ITicketRepository)),
    __metadata("design:paramtypes", [Object, ticket_workflow_service_1.TicketWorkflowService])
], CloseTicketUseCase);
//# sourceMappingURL=close-ticket.use-case.js.map