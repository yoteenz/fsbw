import { clampPanelDebugPercentRect, roundPanelDebugPercent } from './desktopPanelDebugMode';
import type { DesktopNotificationsPercentRect } from '../types/desktopNotifications';

export function clampDesktopNotificationsRect(rect: DesktopNotificationsPercentRect): DesktopNotificationsPercentRect {
  return clampPanelDebugPercentRect(rect);
}

export function desktopNotificationsRectToImageRect(rect: DesktopNotificationsPercentRect) {
  return {
    left: rect.x / 100,
    top: rect.y / 100,
    width: rect.width / 100,
    height: rect.height / 100,
  };
}

export { roundPanelDebugPercent };
