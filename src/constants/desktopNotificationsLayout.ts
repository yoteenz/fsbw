import type {
  DesktopNotificationsLayout,
  DesktopNotificationsPercentRect,
  DesktopNotificationsRectRegionId,
} from '../types/desktopNotifications';

/**
 * Default alignment for the desktop Notifications room.
 * Tune with CTRL+SHIFT+D on `/desktop/notifications`, then export into this file.
 */
export const DESKTOP_NOTIFICATIONS_LAYOUT_SEED: DesktopNotificationsLayout = {
  rects: {
    recentNotification1: { x: 4.2, y: 10.5, width: 14.5, height: 8.5 },
    recentNotification2: { x: 4.2, y: 20.5, width: 14.5, height: 8.5 },
    recentNotification3: { x: 4.2, y: 30.5, width: 14.5, height: 8.5 },
    recentNotification4: { x: 4.2, y: 40.5, width: 14.5, height: 8.5 },
    recentNotification5: { x: 4.2, y: 50.5, width: 14.5, height: 8.5 },
    recentActivityButton: { x: 5.5, y: 60.5, width: 12, height: 4.5 },
    featuredNotificationPanel: { x: 21, y: 11, width: 58, height: 24 },
    priorityAlert1: { x: 81.3, y: 10.5, width: 14.5, height: 8.5 },
    priorityAlert2: { x: 81.3, y: 20.5, width: 14.5, height: 8.5 },
    priorityAlert3: { x: 81.3, y: 30.5, width: 14.5, height: 8.5 },
    priorityAlert4: { x: 81.3, y: 40.5, width: 14.5, height: 8.5 },
    priorityAlert5: { x: 81.3, y: 50.5, width: 14.5, height: 8.5 },
    priorityAlertsButton: { x: 82.5, y: 60.5, width: 12, height: 4.5 },
  },
};

export const DESKTOP_NOTIFICATIONS_DEBUG_PANELS = [
  { id: 'recentNotification1', label: 'RECENT 1', colorGroup: 'blue' },
  { id: 'recentNotification2', label: 'RECENT 2', colorGroup: 'blue' },
  { id: 'recentNotification3', label: 'RECENT 3', colorGroup: 'blue' },
  { id: 'recentNotification4', label: 'RECENT 4', colorGroup: 'blue' },
  { id: 'recentNotification5', label: 'RECENT 5', colorGroup: 'blue' },
  { id: 'recentActivityButton', label: 'ACTIVITY CTA', colorGroup: 'purple' },
  { id: 'featuredNotificationPanel', label: 'FEATURED', colorGroup: 'cyan' },
  { id: 'priorityAlert1', label: 'ALERT 1', colorGroup: 'green' },
  { id: 'priorityAlert2', label: 'ALERT 2', colorGroup: 'green' },
  { id: 'priorityAlert3', label: 'ALERT 3', colorGroup: 'green' },
  { id: 'priorityAlert4', label: 'ALERT 4', colorGroup: 'green' },
  { id: 'priorityAlert5', label: 'ALERT 5', colorGroup: 'green' },
  { id: 'priorityAlertsButton', label: 'ALERTS CTA', colorGroup: 'red' },
] as const;

export function cloneDesktopNotificationsLayout(layout: DesktopNotificationsLayout): DesktopNotificationsLayout {
  return {
    rects: Object.fromEntries(
      Object.entries(layout.rects).map(([k, v]) => [k, { ...v }]),
    ) as DesktopNotificationsLayout['rects'],
  };
}

export function getDesktopNotificationsRect(
  layout: DesktopNotificationsLayout,
  id: DesktopNotificationsRectRegionId,
): DesktopNotificationsPercentRect {
  return layout.rects[id] ?? DESKTOP_NOTIFICATIONS_LAYOUT_SEED.rects[id];
}
