import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { Ticket } from '../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { ITicketHistoryRepository } from '../../domain/repositories/ticket-history.repository.interface';
import { AuditService } from '../../infrastructure/audit/audit.service';
import { UploadDocumentUseCase } from './upload-document.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
export declare class CreateTicketUseCase {
    private readonly ticketRepository;
    private readonly ticketHistoryRepository;
    private readonly auditService;
    private readonly uploadDocumentUseCase;
    private readonly prisma;
    private readonly notificationService;
    constructor(ticketRepository: ITicketRepository, ticketHistoryRepository: ITicketHistoryRepository, auditService: AuditService, uploadDocumentUseCase: UploadDocumentUseCase, prisma: PrismaService, notificationService: NotificationService);
    execute(dto: CreateTicketDto, userId: string, file?: Express.Multer.File): Promise<Ticket>;
}
