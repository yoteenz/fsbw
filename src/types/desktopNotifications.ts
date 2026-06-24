/** Percentage rect on the source hero image (0–100). */
export type DesktopNotificationsPercentRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DesktopNotificationsRectRegionId =
  | 'recentNotification1'
  | 'recentNotification2'
  | 'recentNotification3'
  | 'recentNotification4'
  | 'recentNotification5'
  | 'recentActivityButton'
  | 'featuredNotificationPanel'
  | 'priorityAlert1'
  | 'priorityAlert2'
  | 'priorityAlert3'
  | 'priorityAlert4'
  | 'priorityAlert5'
  | 'priorityAlertsButton';

export type DesktopNotificationsLayout = {
  rects: Record<DesktopNotificationsRectRegionId, DesktopNotificationsPercentRect>;
};

export type DesktopNotificationsDebugColorGroup =
  | 'red'
  | 'blue'
  | 'green'
  | 'purple'
  | 'yellow'
  | 'orange'
  | 'cyan';

export type DesktopNotificationsDebugPanelDef = {
  id: DesktopNotificationsRectRegionId;
  label: string;
  colorGroup: DesktopNotificationsDebugColorGroup;
};
