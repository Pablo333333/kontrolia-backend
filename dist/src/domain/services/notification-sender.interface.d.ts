export declare const NOTIFICATION_SENDER: unique symbol;
export type NotificationChannel = 'PUSH' | 'EMAIL' | 'WHATSAPP';
export interface NotifyUserPayload {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    channels?: NotificationChannel[];
    email?: string | null;
    phone?: string | null;
}
export interface INotificationSender {
    notifyUser(payload: NotifyUserPayload): Promise<void>;
    notifyUsers(userIds: string[], payload: Omit<NotifyUserPayload, 'userId'>): Promise<void>;
}
