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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTicketHistoryRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ticket_history_entity_1 = require("../../domain/entities/ticket-history.entity");
let PrismaTicketHistoryRepository = class PrismaTicketHistoryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(history) {
        const created = await this.prisma.ticketHistory.create({
            data: {
                ticketId: history.ticketId,
                oldStateId: history.oldStateId,
                newStateId: history.newStateId,
                userId: history.userId,
            },
        });
        return new ticket_history_entity_1.TicketHistory(created);
    }
    async findByTicketId(ticketId) {
        const history = await this.prisma.ticketHistory.findMany({
            where: { ticketId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
        });
        const stateIds = [
            ...new Set(history.flatMap(h => [h.oldStateId, h.newStateId].filter(Boolean))),
        ];
        const states = stateIds.length
            ? await this.prisma.workflowState.findMany({ where: { id: { in: stateIds } } })
            : [];
        const stateById = Object.fromEntries(states.map(s => [s.id, s.name]));
        return history.map((h) => new ticket_history_entity_1.TicketHistory({
            ...h,
            oldStateName: h.oldStateId ? stateById[h.oldStateId] : undefined,
            newStateName: stateById[h.newStateId],
            userName: h.user?.name ?? h.user?.email ?? undefined,
        }));
    }
};
exports.PrismaTicketHistoryRepository = PrismaTicketHistoryRepository;
exports.PrismaTicketHistoryRepository = PrismaTicketHistoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTicketHistoryRepository);
//# sourceMappingURL=prisma-ticket-history.repository.js.map