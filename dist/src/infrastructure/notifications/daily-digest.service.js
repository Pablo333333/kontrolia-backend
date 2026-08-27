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
var DailyDigestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyDigestService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_service_1 = require("./notification.service");
let DailyDigestService = DailyDigestService_1 = class DailyDigestService {
    prisma;
    notificationService;
    config;
    logger = new common_1.Logger(DailyDigestService_1.name);
    constructor(prisma, notificationService, config) {
        this.prisma = prisma;
        this.notificationService = notificationService;
        this.config = config;
    }
    async handleDailyDigest() {
        if (this.config.get('DIGEST_ENABLED') === 'false') {
            this.logger.debug('Daily digest disabled via DIGEST_ENABLED=false');
            return;
        }
        await this.sendDigest();
    }
    async sendDigest() {
        const closedStates = await this.prisma.workflowState.findMany({
            where: { name: { in: ['COMPLETADO', 'CERRADO', 'CANCELADO'] } },
            select: { id: true },
        });
        const closedIds = closedStates.map(s => s.id);
        const now = new Date();
        const pending = await this.prisma.ticket.findMany({
            where: {
                isArchived: false,
                workflowStateId: { notIn: closedIds },
            },
            include: {
                status: true,
                destinatario: { select: { id: true, email: true, name: true, phone: true } },
                user: { select: { id: true, name: true } },
                workGroup: { select: { id: true, name: true } },
            },
            orderBy: [{ fechaLimite: 'asc' }, { createdAt: 'desc' }],
        });
        if (pending.length === 0) {
            this.logger.log('Daily digest: no pending messages');
            return { recipients: 0, pending: 0 };
        }
        const byUser = new Map();
        for (const ticket of pending) {
            const targetId = ticket.destinatarioId || ticket.userId;
            const list = byUser.get(targetId) ?? [];
            list.push(ticket);
            byUser.set(targetId, list);
        }
        const groupLeads = await this.prisma.workGroupMember.findMany({
            where: { roleInGroup: 'LEAD' },
            select: { userId: true, workGroupId: true },
        });
        for (const [userId, tickets] of byUser.entries()) {
            const overdue = tickets.filter(t => t.fechaLimite && new Date(t.fechaLimite) < now);
            const lines = tickets.slice(0, 15).map(t => {
                const due = t.fechaLimite
                    ? new Date(t.fechaLimite).toLocaleDateString('es-PE')
                    : 'sin plazo';
                const status = t.status?.name ?? '?';
                return `• [${status}] ${t.title} (vence: ${due}) — de ${t.user?.name || 'N/D'}`;
            });
            const body = [
                `Resumen diario CONECTA — ${now.toLocaleDateString('es-PE')}`,
                ``,
                `Tienes ${tickets.length} mensaje(s) pendiente(s) de respuesta.`,
                overdue.length ? `De ellos, ${overdue.length} ya están vencidos.` : '',
                ``,
                ...lines,
                tickets.length > 15 ? `…y ${tickets.length - 15} más.` : '',
                ``,
                `Abre la app para dar seguimiento.`,
            ]
                .filter(Boolean)
                .join('\n');
            await this.notificationService.notifyUser({
                userId,
                title: 'Resumen diario de pendientes',
                body,
                data: { alertType: 'DAILY_DIGEST', pendingCount: tickets.length },
                channels: ['PUSH', 'EMAIL', 'WHATSAPP'],
            });
        }
        for (const lead of groupLeads) {
            if (byUser.has(lead.userId))
                continue;
            const groupPending = pending.filter(t => t.workGroupId === lead.workGroupId);
            if (groupPending.length === 0)
                continue;
            const body = [
                `Resumen del grupo — ${now.toLocaleDateString('es-PE')}`,
                `${groupPending.length} mensaje(s) pendientes en tu grupo.`,
                ...groupPending.slice(0, 10).map(t => `• ${t.title}`),
            ].join('\n');
            await this.notificationService.notifyUser({
                userId: lead.userId,
                title: 'Resumen diario del grupo',
                body,
                data: { alertType: 'DAILY_DIGEST_GROUP' },
                channels: ['EMAIL', 'PUSH'],
            });
        }
        this.logger.log(`Daily digest sent to ${byUser.size} users (${pending.length} pending)`);
        return { recipients: byUser.size, pending: pending.length };
    }
};
exports.DailyDigestService = DailyDigestService;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *', {
        timeZone: 'America/Lima',
        name: 'daily-digest',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DailyDigestService.prototype, "handleDailyDigest", null);
exports.DailyDigestService = DailyDigestService = DailyDigestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService,
        config_1.ConfigService])
], DailyDigestService);
//# sourceMappingURL=daily-digest.service.js.map