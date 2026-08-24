export const NOTIFICATION_SENDER = Symbol('NOTIFICATION_SENDER');

export type NotificationChannel = 'PUSH' | 'EMAIL' | 'WHATSAPP';

export interface NotifyUserPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
  /** Override email if known; otherwise resolved from user */
  email?: string | null;
  phone?: string | null;
}

export interface INotificationSender {
  notifyUser(payload: NotifyUserPayload): Promise<void>;
  notifyUsers(userIds: string[], payload: Omit<NotifyUserPayload, 'userId'>): Promise<void>;
}
