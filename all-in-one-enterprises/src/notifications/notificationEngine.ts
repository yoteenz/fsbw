import type { AioNotification, NotificationEventType, NotificationCategory, NotificationRecipientType } from './notificationTypes';

export interface CreateNotificationInput {
  organizationId?: string;
  recipientType: NotificationRecipientType;
  recipientId?: string;
  staffId?: string;
  eventType: NotificationEventType;
  category: NotificationCategory;
  title: string;
  body: string;
  dedupeKey?: string;
  entityType?: string;
  entityId?: string;
  link?: string;
}

export function buildNotification(input: CreateNotificationInput): AioNotification {
  return {
    id: crypto.randomUUID(),
    organizationId: input.organizationId,
    recipientType: input.recipientType,
    recipientId: input.recipientId,
    staffId: input.staffId,
    eventType: input.eventType,
    category: input.category,
    title: input.title,
    body: input.body,
    read: false,
    archived: false,
    dedupeKey: input.dedupeKey,
    entityType: input.entityType,
    entityId: input.entityId,
    link: input.link,
    createdAt: new Date().toISOString(),
  };
}

export function shouldCreateNotification(
  existing: AioNotification[],
  dedupeKey: string,
): boolean {
  return !existing.some((n) => n.dedupeKey === dedupeKey && !n.archived);
}

export function filterNotificationsForPortal(
  notifications: AioNotification[],
  organizationId: string,
): AioNotification[] {
  return notifications.filter(
    (n) => n.recipientType === 'customer' && n.organizationId === organizationId && !n.archived,
  );
}

export function filterNotificationsForOffice(notifications: AioNotification[]): AioNotification[] {
  return notifications.filter((n) => n.recipientType === 'staff' && !n.archived);
}

export function unreadCount(notifications: AioNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

/** Future channel adapters — in-app only active in Sprint 06 */
export interface NotificationChannel {
  id: 'in_app' | 'email_future' | 'sms_future' | 'push_future';
  deliver(notification: AioNotification): Promise<void>;
}

export class InAppNotificationChannel implements NotificationChannel {
  id = 'in_app' as const;
  async deliver(): Promise<void> {
    /* persisted via demo store / future backend */
  }
}

export class EmailNotificationChannel implements NotificationChannel {
  id = 'email_future' as const;
  async deliver(): Promise<void> {
    /* not configured in Sprint 06 */
  }
}
