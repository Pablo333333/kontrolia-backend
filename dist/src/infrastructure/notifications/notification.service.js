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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const expo_server_sdk_1 = require("expo-server-sdk");
const prisma_service_1 = require("../prisma/prisma.service");
const email_channel_service_1 = require("./email-channel.service");
const whatsapp_channel_service_1 = require("./whatsapp-channel.service");
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    emailChannel;
    whatsAppChannel;
    logger = new common_1.Logger(NotificationService_1.name);
    expo;
    constructor(prisma, emailChannel, whatsAppChannel) {
        this.prisma = prisma;
        this.emailChannel = emailChannel;
        this.whatsAppChannel = whatsAppChannel;
        this.expo = new expo_server_sdk_1.Expo();
    }
    async notifyUser(payload) {
        const channels = payload.channels ?? ['PUSH', 'EMAIL', 'WHATSAPP'];
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
        const tasks = [];
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
    async notifyUsers(userIds, payload) {
        const unique = [...new Set(userIds.filter(Boolean))];
        await Promise.allSettled(unique.map(userId => this.notifyUser({ ...payload, userId })));
    }
    async sendPushNotification(userId, title, body, data, knownToken) {
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
            if (!expo_server_sdk_1.Expo.isExpoPushToken(pushToken)) {
                this.logger.error(`Push token ${pushToken} is not a valid Expo push token`);
                return;
            }
            const messages = [{
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
                }
                catch (error) {
                    this.logger.error(`Error sending push notification chunk: ${error.message}`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error in sendPushNotification for user ${userId}: ${error.message}`);
        }
    }
    async notifyStateChange(userId, entityType, entityId, newState) {
        await this.notifyUser({
            userId,
            title: `Actualización de ${entityType}`,
            body: `El ${entityType.toLowerCase()} ha cambiado a estado: ${newState}`,
            data: { entityId, entityType, newState },
            channels: ['PUSH', 'EMAIL'],
        });
    }
    async notifyNewMessage(userId, title, ticketId, urgent = false) {
        await this.notifyUser({
            userId,
            title: urgent ? 'Mensaje urgente asignado' : 'Nuevo mensaje asignado',
            body: title,
            data: { entityId: ticketId, entityType: 'TICKET', alertType: urgent ? 'URGENT' : 'NEW_MESSAGE' },
            channels: urgent ? ['PUSH', 'EMAIL', 'WHATSAPP'] : ['PUSH', 'EMAIL', 'WHATSAPP'],
        });
    }
    async notifyOverdue(userId, ticketTitle, ticketId) {
        await this.notifyUser({
            userId,
            title: 'Mensaje vencido',
            body: `"${ticketTitle}" superó su fecha límite de respuesta.`,
            data: { entityId: ticketId, entityType: 'TICKET', alertType: 'OVERDUE' },
            channels: ['PUSH', 'EMAIL', 'WHATSAPP'],
        });
    }
    async notifyApproachingDeadline(userId, ticketTitle, ticketId, hoursLeft) {
        await this.notifyUser({
            userId,
            title: 'Próximo a vencer',
            body: `"${ticketTitle}" vence en aproximadamente ${hoursLeft}h.`,
            data: { entityId: ticketId, entityType: 'TICKET', alertType: 'APPROACHING' },
            channels: ['PUSH', 'EMAIL', 'WHATSAPP'],
        });
    }
    async registerToken(userId, token) {
        if (!expo_server_sdk_1.Expo.isExpoPushToken(token)) {
            throw new Error('Invalid Expo push token');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { pushToken: token },
        });
        this.logger.log(`Registered push token for user ${userId}`);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_channel_service_1.EmailChannelService,
        whatsapp_channel_service_1.WhatsAppChannelService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map