import { mutateInteractionModelStore, readInteractionModelStore } from '../persistence';
import { submitStudioInteraction } from '../interactions/engine';
import type { InteractionPriority } from '../constants';
import type { StudioNotification } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createNotificationId(): string {
  return `NTF-${Date.now().toString(36)}`;
}

export function createStudioNotification(input: {
  sourceObjectId: string;
  recipientObjectId: string;
  title: string;
  body: string;
  priority?: InteractionPriority;
  actionLabel?: string;
  interactionId?: string;
  eventId?: string;
}): StudioNotification {
  const timestamp = now();

  const interaction =
    input.interactionId ??
    submitStudioInteraction({
      interactionType: 'notification',
      officialName: input.title,
      initiatorObjectId: input.sourceObjectId,
      recipientObjectId: input.recipientObjectId,
      priority: input.priority ?? 'normal',
    }).interactionId;

  const notification: StudioNotification = {
    notificationId: createNotificationId(),
    interactionId: interaction,
    eventId: input.eventId,
    sourceObjectId: input.sourceObjectId,
    recipientObjectId: input.recipientObjectId,
    title: input.title.trim(),
    body: input.body.trim(),
    priority: input.priority ?? 'normal',
    actionLabel: input.actionLabel,
    status: 'created',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateInteractionModelStore((store) => ({
    ...store,
    notifications: [...store.notifications, notification],
  }));

  return notification;
}

export function listStudioNotifications(recipientObjectId?: string): StudioNotification[] {
  const notifications = readInteractionModelStore().notifications;
  return recipientObjectId
    ? notifications.filter((n) => n.recipientObjectId === recipientObjectId)
    : notifications;
}

export function markNotificationDelivered(notificationId: string): StudioNotification | undefined {
  return updateNotificationStatus(notificationId, 'delivered');
}

export function markNotificationRead(notificationId: string): StudioNotification | undefined {
  return updateNotificationStatus(notificationId, 'read');
}

function updateNotificationStatus(
  notificationId: string,
  status: StudioNotification['status']
): StudioNotification | undefined {
  let updated: StudioNotification | undefined;

  mutateInteractionModelStore((store) => {
    const idx = store.notifications.findIndex((n) => n.notificationId === notificationId);
    if (idx < 0) return store;

    updated = {
      ...store.notifications[idx],
      status,
      updatedAt: now(),
    };

    const notifications = [...store.notifications];
    notifications[idx] = updated;
    return { ...store, notifications };
  });

  return updated;
}

export function listPendingNotifications(): StudioNotification[] {
  return listStudioNotifications().filter(
    (n) => n.status === 'created' || n.status === 'delivered'
  );
}
