import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { Ticket } from '../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { ITicketHistoryRepository } from '../../domain/repositories/ticket-history.repository.interface';
import { TicketHistory } from '../../domain/entities/ticket-history.entity';
import { Inject, Injectable } from '@nestjs/common';
import { AuditService } from '../../infrastructure/audit/audit.service';
import { UploadDocumentUseCase } from './upload-document.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import {
  composeCategoryTitle,
  resolveSubcategoryId,
} from '../utils/resolve-subcategory';

@Injectable()
export class CreateTicketUseCase {
  constructor(
    @Inject(ITicketRepository)
    private readonly ticketRepository: ITicketRepository,
    @Inject(ITicketHistoryRepository)
    private readonly ticketHistoryRepository: ITicketHistoryRepository,
    private readonly auditService: AuditService,
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(dto: CreateTicketDto, userId: string, file?: Express.Multer.File): Promise<Ticket> {
    const nuevoState = await this.prisma.workflowState.findFirst({
      where: { name: 'NUEVO' },
    });

    let parentTicketId: string | undefined;
    let rootTicketId: string | undefined;
    let isContinuation = false;
    let workGroupId: string | undefined;

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
        if ((parent as any).workGroupId) {
          workGroupId = (parent as any).workGroupId;
        }
      }
    }

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
      include: { subcategories: true },
    });

    const subcategoryId = resolveSubcategoryId({
      subcategories: category?.subcategories ?? [],
      title: dto.title,
      messageType: dto.messageType,
      tramiteSubtype: dto.tramiteSubtype,
      explicitId: dto.subcategoryId,
    });

    const subcategory = subcategoryId
      ? category?.subcategories.find((s) => s.id === subcategoryId)
      : undefined;

    const title = composeCategoryTitle(
      category?.name ?? 'Mensaje',
      subcategory?.name,
      dto.title,
    );

    const ticket = new Ticket({
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
    } as any);

    const createdTicket = await this.ticketRepository.create(ticket);

    if (!createdTicket.rootTicketId) {
      await this.ticketRepository.update(createdTicket.id, {
        rootTicketId: createdTicket.id,
      } as Partial<Ticket>);
      createdTicket.rootTicketId = createdTicket.id;
    }

    if (createdTicket.workflowStateId) {
      await this.ticketHistoryRepository.create(
        new TicketHistory({
          ticketId: createdTicket.id,
          oldStateId: null,
          newStateId: createdTicket.workflowStateId,
          userId,
        }),
      );
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
      await this.notificationService.notifyNewMessage(
        dto.destinatarioId,
        title,
        createdTicket.id,
        dto.priority === 'URGENTE',
      );
    } else if (!dto.destinatarioId && workGroupId) {
      const members = await this.prisma.workGroupMember.findMany({
        where: { workGroupId, userId: { not: userId } },
        select: { userId: true },
      });
      await this.notificationService.notifyUsers(
        members.map(m => m.userId),
        {
          title: dto.priority === 'URGENTE' ? 'Mensaje urgente al grupo' : 'Nuevo mensaje al grupo',
          body: title,
          data: { entityId: createdTicket.id, entityType: 'TICKET', alertType: 'NEW_MESSAGE' },
          channels: ['PUSH', 'EMAIL', 'WHATSAPP'],
        },
      );
    }

    return createdTicket;
  }
}
