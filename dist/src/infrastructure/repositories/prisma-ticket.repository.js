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
exports.PrismaTicketRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ticket_entity_1 = require("../../domain/entities/ticket.entity");
let PrismaTicketRepository = class PrismaTicketRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(ticket) {
        const created = await this.prisma.ticket.create({
            data: {
                title: ticket.title,
                description: ticket.description,
                latitude: ticket.latitude,
                longitude: ticket.longitude,
                userId: ticket.userId,
                categoryId: ticket.categoryId,
                subcategoryId: ticket.subcategoryId ?? undefined,
                workflowStateId: ticket.workflowStateId,
                destinatarioId: ticket.destinatarioId ?? undefined,
                messageType: ticket.messageType ?? undefined,
                tramiteSubtype: ticket.tramiteSubtype ?? undefined,
                responseUrgency: ticket.responseUrgency ?? undefined,
                fechaLimite: ticket.fechaLimite ?? undefined,
                locationLabel: ticket.locationLabel ?? undefined,
                parentTicketId: ticket.parentTicketId ?? undefined,
                rootTicketId: ticket.rootTicketId ?? undefined,
                isContinuation: ticket.isContinuation ?? false,
                workGroupId: ticket.workGroupId ?? undefined,
                priority: ticket.priority || 'BAJA',
                isArchived: ticket.isArchived || false,
            },
        });
        return new ticket_entity_1.Ticket(created);
    }
    async findById(id) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: {
                category: true,
                subcategory: true,
                status: true,
                user: true,
                destinatario: true,
                comments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { content: true, createdAt: true },
                },
            },
        });
        if (!ticket)
            return null;
        const lastComment = ticket.comments?.[0];
        return new ticket_entity_1.Ticket({
            ...ticket,
            categoryName: ticket.category.name,
            subcategoryName: ticket.subcategory?.name ?? null,
            statusName: ticket.status.name,
            remitenteName: ticket.user?.name ?? ticket.user?.email ?? null,
            destinatarioName: ticket.destinatario?.name ?? ticket.destinatario?.email ?? null,
            lastResponseContent: lastComment?.content ?? null,
            lastResponseAt: lastComment?.createdAt ?? null,
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.categoryId)
            where.categoryId = filters.categoryId;
        if (filters?.subcategoryId)
            where.subcategoryId = filters.subcategoryId;
        if (filters?.workflowStateId)
            where.workflowStateId = filters.workflowStateId;
        if (filters?.priority)
            where.priority = filters.priority.toUpperCase();
        if (filters?.messageType)
            where.messageType = filters.messageType;
        if (filters?.userId)
            where.userId = filters.userId;
        if (filters?.destinatarioId)
            where.destinatarioId = filters.destinatarioId;
        if (!filters?.includeArchived) {
            where.isArchived = false;
        }
        if (filters?.q) {
            where.OR = [
                { title: { contains: filters.q, mode: 'insensitive' } },
                { description: { contains: filters.q, mode: 'insensitive' } },
                { documents: { some: { extractedText: { contains: filters.q, mode: 'insensitive' } } } },
            ];
        }
        const take = Math.min(Math.max(filters?.limit ?? 100, 1), 300);
        const skip = Math.max(filters?.offset ?? 0, 0);
        const includeLastResponse = filters?.includeLastResponse !== false;
        const tickets = await this.prisma.ticket.findMany({
            where,
            take,
            skip,
            include: {
                category: { select: { id: true, name: true } },
                subcategory: { select: { id: true, name: true } },
                status: { select: { id: true, name: true } },
                user: { select: { id: true, name: true, email: true } },
                destinatario: { select: { id: true, name: true, email: true } },
                ...(includeLastResponse
                    ? {
                        comments: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            select: { content: true, createdAt: true },
                        },
                    }
                    : {}),
                ...(filters?.includeDocuments
                    ? { documents: { where: { isLatest: true }, take: 5 } }
                    : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
        return tickets.map((t) => {
            const lastComment = t.comments?.[0];
            return new ticket_entity_1.Ticket({
                ...t,
                categoryName: t.category.name,
                subcategoryName: t.subcategory?.name ?? null,
                statusName: t.status.name,
                documents: t.documents,
                remitenteName: t.user?.name ?? t.user?.email ?? null,
                destinatarioName: t.destinatario?.name ?? t.destinatario?.email ?? null,
                lastResponseContent: lastComment?.content ?? null,
                lastResponseAt: lastComment?.createdAt ?? null,
            });
        });
    }
    async getStats() {
        const allTickets = await this.prisma.ticket.findMany({
            select: {
                id: true,
                userId: true,
                isArchived: true,
                priority: true,
                messageType: true,
                tramiteSubtype: true,
                isContinuation: true,
                fechaLimite: true,
                locationLabel: true,
                createdAt: true,
                updatedAt: true,
                status: { select: { name: true } },
                category: { select: { name: true } },
                user: { select: { name: true } },
                destinatario: { select: { name: true, email: true } },
                comments: {
                    orderBy: { createdAt: 'asc' },
                    take: 10,
                    select: { createdAt: true, userId: true },
                },
            },
        });
        const activeTickets = allTickets.filter(t => !t.isArchived);
        const now = new Date();
        const statusName = (t) => t.status?.name?.toUpperCase() ?? '';
        const isClosed = (t) => ['COMPLETADO', 'CERRADO'].includes(statusName(t));
        const vencidos = activeTickets.filter(t => {
            if (!t.fechaLimite || isClosed(t))
                return false;
            return new Date(t.fechaLimite) < now;
        }).length;
        const dashboard = {
            nuevos: activeTickets.filter(t => statusName(t) === 'NUEVO').length,
            enProceso: activeTickets.filter(t => statusName(t) === 'EN_PROCESO').length,
            completados: activeTickets.filter(t => statusName(t) === 'COMPLETADO').length,
            cerrados: allTickets.filter(t => statusName(t) === 'CERRADO' || t.isArchived).length,
            cancelados: activeTickets.filter(t => statusName(t) === 'CANCELADO').length,
            vencidos,
            overdue: vencidos,
            pending: activeTickets.filter(t => ['NUEVO', 'EN_PROCESO'].includes(statusName(t))).length,
            nuevosTemas: activeTickets.filter(t => !t.isContinuation).length,
            continuaciones: activeTickets.filter(t => t.isContinuation).length,
        };
        const responseDurationsHours = [];
        for (const t of allTickets) {
            const firstReply = t.comments?.find(c => c.userId !== t.userId);
            let respondedAt = firstReply ? new Date(firstReply.createdAt) : null;
            if (!respondedAt && isClosed(t)) {
                respondedAt = new Date(t.updatedAt);
            }
            if (respondedAt) {
                const hours = (respondedAt.getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
                if (hours >= 0)
                    responseDurationsHours.push(hours);
            }
        }
        const avgResponseHours = responseDurationsHours.length
            ? Math.round((responseDurationsHours.reduce((a, b) => a + b, 0) / responseDurationsHours.length) * 10) / 10
            : 0;
        const kpis = {
            total: activeTickets.length,
            pending: dashboard.pending,
            completed: activeTickets.filter(t => isClosed(t)).length,
            urgent: activeTickets.filter(t => t.priority && t.priority.toUpperCase() === 'URGENTE').length,
            avgResponseHours,
        };
        const categoryMap = {};
        activeTickets.forEach(t => {
            const name = t.category?.name || 'Sin Categoría';
            categoryMap[name] = (categoryMap[name] || 0) + 1;
        });
        const byCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
        const userMap = {};
        activeTickets.forEach(t => {
            const name = t.user?.name || 'Usuario Desconocido';
            userMap[name] = (userMap[name] || 0) + 1;
        });
        const byUser = Object.entries(userMap).map(([name, tickets]) => ({ name, tickets }));
        const bySender = byUser.map(({ name, tickets }) => ({ name, value: tickets }));
        const recipientMap = {};
        activeTickets.forEach(t => {
            const name = t.destinatario?.name || t.destinatario?.email || 'Todo el grupo';
            recipientMap[name] = (recipientMap[name] || 0) + 1;
        });
        const byRecipient = Object.entries(recipientMap).map(([name, value]) => ({ name, value }));
        const locationMap = {};
        activeTickets.forEach(t => {
            const name = t.locationLabel?.trim() || 'Sin ubicación';
            locationMap[name] = (locationMap[name] || 0) + 1;
        });
        const byLocation = Object.entries(locationMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 12);
        const priorityMap = { URGENTE: 0, MEDIA: 0, BAJA: 0 };
        activeTickets.forEach(t => {
            const key = (t.priority || 'BAJA').toUpperCase();
            priorityMap[key] = (priorityMap[key] || 0) + 1;
        });
        const byPriority = Object.entries(priorityMap).map(([name, value]) => ({ name, value }));
        const typeMap = {};
        activeTickets.forEach(t => {
            const name = t.messageType || t.tramiteSubtype || 'SIN_TIPO';
            typeMap[name] = (typeMap[name] || 0) + 1;
        });
        const byMessageType = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
        const evolution = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);
            const creados = allTickets.filter(t => new Date(t.createdAt) >= date && new Date(t.createdAt) < nextDate).length;
            const cerrados = allTickets.filter(t => new Date(t.updatedAt) >= date && new Date(t.updatedAt) < nextDate &&
                (t.status?.name?.toUpperCase() === 'CERRADO' || t.status?.name?.toUpperCase() === 'COMPLETADO')).length;
            evolution.push({
                name: date.toLocaleDateString('es-ES', { weekday: 'short' }),
                date: date.toISOString().slice(0, 10),
                creados,
                cerrados,
            });
        }
        return {
            dashboard,
            kpis,
            byCategory,
            byUser,
            bySender,
            byRecipient,
            byLocation,
            byPriority,
            byMessageType,
            evolution,
            avgResponseHours,
        };
    }
    async update(id, ticket) {
        const updated = await this.prisma.ticket.update({
            where: { id },
            data: {
                title: ticket.title,
                description: ticket.description,
                workflowStateId: ticket.workflowStateId,
                categoryId: ticket.categoryId,
                subcategoryId: ticket.subcategoryId === undefined ? undefined : ticket.subcategoryId,
                priority: ticket.priority,
                isArchived: ticket.isArchived,
                rootTicketId: ticket.rootTicketId,
                parentTicketId: ticket.parentTicketId,
                isContinuation: ticket.isContinuation,
            },
        });
        return new ticket_entity_1.Ticket(updated);
    }
    async delete(id) {
        await this.prisma.ticket.delete({
            where: { id },
        });
    }
};
exports.PrismaTicketRepository = PrismaTicketRepository;
exports.PrismaTicketRepository = PrismaTicketRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTicketRepository);
//# sourceMappingURL=prisma-ticket.repository.js.map