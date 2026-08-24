import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { Ticket } from '../../domain/entities/ticket.entity';

@Injectable()
export class PrismaTicketRepository implements ITicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(ticket: Ticket): Promise<Ticket> {
    const created = await this.prisma.ticket.create({
      data: {
        title: ticket.title,
        description: ticket.description,
        latitude: ticket.latitude,
        longitude: ticket.longitude,
        userId: ticket.userId,
        categoryId: ticket.categoryId,
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
        priority: (ticket.priority as any) || 'BAJA',
        isArchived: ticket.isArchived || false,
      },
    });

    return new Ticket(created);
  }

  async findById(id: string): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        category: true,
        status: true,
        user: true,
        destinatario: true,
      },
    });

    if (!ticket) return null;
    return new Ticket({
      ...ticket,
      categoryName: ticket.category.name,
      statusName: ticket.status.name,
      remitenteName: ticket.user?.name ?? ticket.user?.email ?? null,
      destinatarioName: ticket.destinatario?.name ?? ticket.destinatario?.email ?? null,
    } as any);
  }

  async findAll(filters?: {
    categoryId?: string;
    workflowStateId?: string;
    q?: string;
    includeArchived?: boolean;
    includeDocuments?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Ticket[]> {
    const where: any = {};
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.workflowStateId) where.workflowStateId = filters.workflowStateId;

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

    const tickets = await this.prisma.ticket.findMany({
      where,
      take,
      skip,
      include: {
        category: { select: { id: true, name: true } },
        status: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
        destinatario: { select: { id: true, name: true, email: true } },
        ...(filters?.includeDocuments
          ? { documents: { where: { isLatest: true }, take: 5 } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map((t) => new Ticket({
      ...t,
      categoryName: t.category.name,
      statusName: t.status.name,
      documents: (t as any).documents,
      remitenteName: t.user?.name ?? t.user?.email ?? null,
      destinatarioName: t.destinatario?.name ?? t.destinatario?.email ?? null,
    } as any));
  }

  async getStats(): Promise<any> {
    const allTickets = await this.prisma.ticket.findMany({
      select: {
        id: true,
        isArchived: true,
        priority: true,
        messageType: true,
        tramiteSubtype: true,
        isContinuation: true,
        fechaLimite: true,
        createdAt: true,
        updatedAt: true,
        status: { select: { name: true } },
        category: { select: { name: true } },
        user: { select: { name: true } },
      },
    });

    const activeTickets = allTickets.filter(t => !t.isArchived);
    const now = new Date();

    const statusName = (t: (typeof allTickets)[number]) =>
      t.status?.name?.toUpperCase() ?? '';

    const isClosed = (t: (typeof allTickets)[number]) =>
      ['COMPLETADO', 'CERRADO'].includes(statusName(t));

    const vencidos = activeTickets.filter(t => {
      if (!t.fechaLimite || isClosed(t)) return false;
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
      pending: activeTickets.filter(t =>
        ['NUEVO', 'EN_PROCESO'].includes(statusName(t)),
      ).length,
      nuevosTemas: activeTickets.filter(t => !t.isContinuation).length,
      continuaciones: activeTickets.filter(t => t.isContinuation).length,
    };

    const kpis = {
      total: activeTickets.length,
      pending: dashboard.pending,
      completed: activeTickets.filter(t => isClosed(t)).length,
      urgent: activeTickets.filter(t =>
        t.priority && t.priority.toUpperCase() === 'URGENTE',
      ).length,
    };

    const categoryMap: Record<string, number> = {};
    activeTickets.forEach(t => {
      const name = t.category?.name || 'Sin Categoría';
      categoryMap[name] = (categoryMap[name] || 0) + 1;
    });
    const byCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    const userMap: Record<string, number> = {};
    activeTickets.forEach(t => {
      const name = t.user?.name || 'Usuario Desconocido';
      userMap[name] = (userMap[name] || 0) + 1;
    });
    const byUser = Object.entries(userMap).map(([name, tickets]) => ({ name, tickets }));

    const priorityMap: Record<string, number> = { URGENTE: 0, MEDIA: 0, BAJA: 0 };
    activeTickets.forEach(t => {
      const key = (t.priority || 'BAJA').toUpperCase();
      priorityMap[key] = (priorityMap[key] || 0) + 1;
    });
    const byPriority = Object.entries(priorityMap).map(([name, value]) => ({ name, value }));

    const typeMap: Record<string, number> = {};
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

      const creados = allTickets.filter(t =>
        new Date(t.createdAt) >= date && new Date(t.createdAt) < nextDate
      ).length;

      const cerrados = allTickets.filter(t =>
        new Date(t.updatedAt) >= date && new Date(t.updatedAt) < nextDate &&
        (t.status?.name?.toUpperCase() === 'CERRADO' || t.status?.name?.toUpperCase() === 'COMPLETADO')
      ).length;

      evolution.push({
        name: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        creados,
        cerrados,
      });
    }

    return { dashboard, kpis, byCategory, byUser, byPriority, byMessageType, evolution };
  }

  async update(id: string, ticket: Partial<Ticket>): Promise<Ticket> {
    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        title: ticket.title,
        description: ticket.description,
        workflowStateId: ticket.workflowStateId,
        categoryId: ticket.categoryId,
        priority: ticket.priority as any,
        isArchived: ticket.isArchived,
        rootTicketId: ticket.rootTicketId,
        parentTicketId: ticket.parentTicketId,
        isContinuation: ticket.isContinuation,
      },
    });

    return new Ticket(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.ticket.delete({
      where: { id },
    });
  }
}
