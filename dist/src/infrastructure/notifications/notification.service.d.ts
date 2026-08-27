import { PrismaService } from '../prisma/prisma.service';
import { EmailChannelService } from './email-channel.service';
import { WhatsAppChannelService } from './whatsapp-channel.service';
import { INotificationSender, NotifyUserPayload } from '../../domain/services/notification-sender.interface';
export declare class NotificationService implements INotificationSender {
    private readonly prisma;
    private readonly emailChannel;
    private readonly whatsAppChannel;
    private readonly logger;
    private expo;
    constructor(prisma: PrismaService, emailChannel: EmailChannelService, whatsAppChannel: WhatsAppChannelService);
    notifyUser(payload: NotifyUserPayload): Promise<void>;
    notifyUsers(userIds: string[], payload: Omit<NotifyUserPayload, 'userId'>): Promise<void>;
    sendPushNotification(userId: string, title: string, body: string, data?: any, knownToken?: string | null): Promise<void>;
    notifyStateChange(userId: string, entityType: string, entityId: string, newState: string): Promise<void>;
    notifyNewMessage(userId: string, title: string, ticketId: string, urgent?: boolean): Promise<void>;
    notifyOverdue(userId: string, ticketTitle: string, ticketId: string): Promise<void>;
    notifyApproachingDeadline(userId: string, ticketTitle: string, ticketId: string, hoursLeft: number): Promise<void>;
    registerToken(userId: string, token: string): Promise<void>;
}
