import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';
export declare class DailyDigestService {
    private readonly prisma;
    private readonly notificationService;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, notificationService: NotificationService, config: ConfigService);
    handleDailyDigest(): Promise<void>;
    sendDigest(): Promise<{
        recipients: number;
        pending: number;
    }>;
}
