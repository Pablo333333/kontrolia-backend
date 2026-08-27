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
exports.SaveSmartDocumentUseCase = void 0;
const common_1 = require("@nestjs/common");
const ticket_repository_interface_1 = require("../../domain/repositories/ticket.repository.interface");
const create_comment_use_case_1 = require("./create-comment.use-case");
let SaveSmartDocumentUseCase = class SaveSmartDocumentUseCase {
    ticketRepository;
    createCommentUseCase;
    constructor(ticketRepository, createCommentUseCase) {
        this.ticketRepository = ticketRepository;
        this.createCommentUseCase = createCommentUseCase;
    }
    async execute(ticketId, dto, userId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        const title = dto.title || ticket.title;
        await this.createCommentUseCase.execute({
            content: `[Documento Automático: ${title}]\n\n${dto.content}`,
            userId,
            ticketId,
        });
        return { success: true, message: 'Documento guardado en el hilo de comunicación' };
    }
};
exports.SaveSmartDocumentUseCase = SaveSmartDocumentUseCase;
exports.SaveSmartDocumentUseCase = SaveSmartDocumentUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.ITicketRepository)),
    __metadata("design:paramtypes", [Object, create_comment_use_case_1.CreateCommentUseCase])
], SaveSmartDocumentUseCase);
//# sourceMappingURL=save-smart-document.use-case.js.map