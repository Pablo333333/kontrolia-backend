import { Module, Global } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { OverdueReminderService } from './overdue-reminder.service';
import { DailyDigestService } from './daily-digest.service';
import { EmailChannelService } from './email-channel.service';
import { WhatsAppChannelService } from './whatsapp-channel.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationController } from '../../presentation/notifications/notification.controller';
import { NOTIFICATION_SENDER } from '../../domain/services/notification-sender.interface';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule, ScheduleModule.forRoot()],
  controllers: [NotificationController],
  providers: [
    EmailChannelService,
    WhatsAppChannelService,
    NotificationService,
    OverdueReminderService,
    DailyDigestService,
    { provide: NOTIFICATION_SENDER, useExisting: NotificationService },
  ],
  exports: [
    NotificationService,
    OverdueReminderService,
    DailyDigestService,
    EmailChannelService,
    WhatsAppChannelService,
    NOTIFICATION_SENDER,
  ],
})
export class NotificationModule {}
