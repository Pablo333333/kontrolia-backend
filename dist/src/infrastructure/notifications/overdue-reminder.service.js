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
var OverdueReminderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverdueReminderService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_service_1 = require("./notification.service");
let OverdueReminderService = OverdueReminderService_1 = class OverdueReminderService {
    prisma;
    notificationService;
    logger = new common_1.Logger(OverdueReminderService_1.name);
    notifiedApproaching = new Set();
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    onModuleInit() {
        this.checkOverdueAndPending().catch(err => this.logger.error(`Initial overdue check failed: ${err.message}`));
    }
    async handleHourlyCheck() {
        await this.checkOverdueAndPending();
    }
    async checkOverdueAndPending() {
        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const closedStates = await this.prisma.workflowState.findMany({
            where: { name: { in: ['COMPLETADO', 'CERRADO', 'CANCELADO'] } },
            select: { id: true },
        });
        const closedIds = closedStates.map(s => s.id);
        const overdueTickets = await this.prisma.ticket.findMany({
            where: {
                isArchived: false,
                fechaLimite: { lt: now },
                workflowStateId: { notIn: closedIds },
            },
            include: {
                user: { select: { id: true } },
                destinatario: { select: { id: true } },
            },
        });
        const approachingTickets = await this.prisma.ticket.findMany({
            where: {
                isArchived: false,
                fechaLimite: { gte: now, lte: in24h },
                workflowStateId: { notIn: closedIds },
                priority: { in: ['URGENTE', 'MEDIA'] },
            },
            include: {
                destinatario: { select: { id: true } },
                user: { select: { id: true } },
            },
        });
        const pendingTickets = await this.prisma.ticket.findMany({
            where: {
                isArchived: false,
                workflowStateId: {
                    in: (await this.prisma.workflowState.findMany({
                        where: { name: { in: ['NUEVO', 'EN_PROCESO'] } },
                        select: { id: true },
                    })).map(s => s.id),
                },
            },
        });
        for (const ticket of overdueTickets) {
            const targetUserId = ticket.destinatarioId || ticket.userId;
            await this.notificationService.notifyOverdue(targetUserId, ticket.title, ticket.id);
        }
        for (const ticket of approachingTickets) {
            const key = `approach:${ticket.id}`;
            if (this.notifiedApproaching.has(key))
                continue;
            const targetUserId = ticket.destinatarioId || ticket.userId;
            const hoursLeft = Math.max(1, Math.ceil((new Date(ticket.fechaLimite).getTime() - now.getTime()) / (1000 * 60 * 60)));
            await this.notificationService.notifyApproachingDeadline(targetUserId, ticket.title, ticket.id, hoursLeft);
            this.notifiedApproaching.add(key);
        }
        this.logger.log(`Reminders: overdue=${overdueTickets.length} approaching=${approachingTickets.length} pending=${pendingTickets.length}`);
        return {
            overdue: overdueTickets.length,
            pending: pendingTickets.length,
            approaching: approachingTickets.length,
        };
    }
};
exports.OverdueReminderService = OverdueReminderService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OverdueReminderService.prototype, "handleHourlyCheck", null);
exports.OverdueReminderService = OverdueReminderService = OverdueReminderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], OverdueReminderService);
//# sourceMappingURL=overdue-reminder.service.js.map