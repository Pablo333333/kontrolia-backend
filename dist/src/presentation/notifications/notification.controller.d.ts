import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { OverdueReminderService } from '../../infrastructure/notifications/overdue-reminder.service';
export declare class NotificationController {
    private readonly notificationService;
    private readonly overdueReminderService;
    constructor(notificationService: NotificationService, overdueReminderService: OverdueReminderService);
    registerToken(req: any, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getReport(): Promise<{
        overdue: number;
        pending: number;
        approaching: number;
    }>;
}
