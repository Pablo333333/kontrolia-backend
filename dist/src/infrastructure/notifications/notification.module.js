"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const notification_service_1 = require("./notification.service");
const overdue_reminder_service_1 = require("./overdue-reminder.service");
const daily_digest_service_1 = require("./daily-digest.service");
const email_channel_service_1 = require("./email-channel.service");
const whatsapp_channel_service_1 = require("./whatsapp-channel.service");
const prisma_module_1 = require("../prisma/prisma.module");
const notification_controller_1 = require("../../presentation/notifications/notification.controller");
const notification_sender_interface_1 = require("../../domain/services/notification-sender.interface");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, prisma_module_1.PrismaModule, schedule_1.ScheduleModule.forRoot()],
        controllers: [notification_controller_1.NotificationController],
        providers: [
            email_channel_service_1.EmailChannelService,
            whatsapp_channel_service_1.WhatsAppChannelService,
            notification_service_1.NotificationService,
            overdue_reminder_service_1.OverdueReminderService,
            daily_digest_service_1.DailyDigestService,
            { provide: notification_sender_interface_1.NOTIFICATION_SENDER, useExisting: notification_service_1.NotificationService },
        ],
        exports: [
            notification_service_1.NotificationService,
            overdue_reminder_service_1.OverdueReminderService,
            daily_digest_service_1.DailyDigestService,
            email_channel_service_1.EmailChannelService,
            whatsapp_channel_service_1.WhatsAppChannelService,
            notification_sender_interface_1.NOTIFICATION_SENDER,
        ],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map