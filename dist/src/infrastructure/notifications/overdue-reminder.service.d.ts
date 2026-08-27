import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';
export declare class OverdueReminderService implements OnModuleInit {
    private readonly prisma;
    private readonly notificationService;
    private readonly logger;
    private readonly notifiedApproaching;
    constructor(prisma: PrismaService, notificationService: NotificationService);
    onModuleInit(): void;
    handleHourlyCheck(): Promise<void>;
    checkOverdueAndPending(): Promise<{
        overdue: number;
        pending: number;
        approaching: number;
    }>;
}
