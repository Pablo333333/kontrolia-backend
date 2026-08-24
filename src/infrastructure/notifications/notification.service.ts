import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { EmailChannelService } from './email-channel.service';
import { WhatsAppChannelService } from './whatsapp-channel.service';
import {
  INotificationSender,
  NotifyUserPayload,
  NotificationChannel,
} from '../../domain/services/notification-sender.interface';

@Injectable()
export class NotificationService implements INotificationSender {
  private readonly logger = new Logger(NotificationService.name);
  private expo: Expo;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailChannel: EmailChannelService,
    private readonly whatsAppChannel: WhatsAppChannelService,
  ) {
    this.expo = new Expo();
  }

  async notifyUser(payload: NotifyUserPayload): Promise<void> {
    const channels: NotificationChannel[] = payload.channels ?? ['PUSH', 'EMAIL', 'WHATSAPP'];

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, phone: true, pushToken: true, name: true },
    });

    if (!user) {
      this.logger.warn(`notifyUser: user ${payload.userId} not found`);
      return;
    }

    const email = payload.email ?? user.email;
    const phone = payload.phone ?? user.phone;

    const tasks: Promise<unknown>[] = [];

    if (channels.includes('PUSH')) {
      tasks.push(this.sendPushNotification(payload.userId, payload.title, payload.body, payload.data, user.pushToken));
    }
    if (channels.includes('EMAIL') && email) {
      tasks.push(this.emailChannel.send(email, payload.title, payload.body));
    }
    if (channels.includes('WHATSAPP') && phone) {
      tasks.push(this.whatsAppChannel.send(phone, `*${payload.title}*\n${payload.body}`));
    }

    await Promise.allSettled(tasks);
  }

  async notifyUsers(userIds: string[], payload: Omit<NotifyUserPayload, 'userId'>): Promise<void> {
    const unique = [...new Set(userIds.filter(Boolean))];
    await Promise.allSettled(unique.map(userId => this.notifyUser({ ...payload, userId })));
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
    knownToken?: string | null,
  ) {
    try {
      let pushToken = knownToken;
      if (pushToken === undefined) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { pushToken: true },
        });
        pushToken = user?.pushToken ?? null;
      }

      if (!pushToken) {
        this.logger.warn(`User ${userId} has no push token`);
        return;
      }

      if (!Expo.isExpoPushToken(pushToken)) {
        this.logger.error(`Push token ${pushToken} is not a valid Expo push token`);
        return;
      }

      const messages: ExpoPushMessage[] = [{
        to: pushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
      }];

      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          await this.expo.sendPushNotificationsAsync(chunk);
          this.logger.log(`Sent push notification chunk to user ${userId}`);
        } catch (error: any) {
          this.logger.error(`Error sending push notification chunk: ${error.message}`);
        }
      }
    } catch (error: any) {
      this.logger.error(`Error in sendPushNotification for user ${userId}: ${error.message}`);
    }
  }

  async notifyStateChange(userId: string, entityType: string, entityId: string, newState: string) {
    await this.notifyUser({
      userId,
      title: `Actualización de ${entityType}`,
      body: `El ${entityType.toLowerCase()} ha cambiado a estado: ${newState}`,
      data: { entityId, entityType, newState },
      channels: ['PUSH', 'EMAIL'],
    });
  }

  async notifyNewMessage(userId: string, title: string, ticketId: string, urgent = false) {
    await this.notifyUser({
      userId,
      title: urgent ? 'Mensaje urgente asignado' : 'Nuevo mensaje asignado',
      body: title,
      data: { entityId: ticketId, entityType: 'TICKET', alertType: urgent ? 'URGENT' : 'NEW_MESSAGE' },
      channels: urgent ? ['PUSH', 'EMAIL', 'WHATSAPP'] : ['PUSH', 'EMAIL', 'WHATSAPP'],
    });
  }

  async notifyOverdue(userId: string, ticketTitle: string, ticketId: string) {
    await this.notifyUser({
      userId,
      title: 'Mensaje vencido',
      body: `"${ticketTitle}" superó su fecha límite de respuesta.`,
      data: { entityId: ticketId, entityType: 'TICKET', alertType: 'OVERDUE' },
      channels: ['PUSH', 'EMAIL', 'WHATSAPP'],
    });
  }

  async notifyApproachingDeadline(userId: string, ticketTitle: string, ticketId: string, hoursLeft: number) {
    await this.notifyUser({
      userId,
      title: 'Próximo a vencer',
      body: `"${ticketTitle}" vence en aproximadamente ${hoursLeft}h.`,
      data: { entityId: ticketId, entityType: 'TICKET', alertType: 'APPROACHING' },
      channels: ['PUSH', 'EMAIL', 'WHATSAPP'],
    });
  }

  async registerToken(userId: string, token: string) {
    if (!Expo.isExpoPushToken(token)) {
      throw new Error('Invalid Expo push token');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { pushToken: token },
    });

    this.logger.log(`Registered push token for user ${userId}`);
  }
}
