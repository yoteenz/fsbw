import type { CSSProperties, ReactNode, RefObject } from 'react';
import { DESKTOP_NOTIFICATIONS_IMAGE } from '../../constants/desktopNotifications';
import type { DesktopNotificationsPercentRect, DesktopNotificationsRectRegionId } from '../../types/desktopNotifications';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import { getDesktopNotificationsRect } from '../../constants/desktopNotificationsLayout';
import { desktopNotificationsRectToImageRect } from '../../utils/desktopNotificationsLayoutMath';
import { useDesktopNotificationsLayout } from './DesktopNotificationsDebugProvider';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  regionId: DesktopNotificationsRectRegionId;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  zIndex?: number;
};

export function DesktopNotificationsPanelAnchor({
  measureRef,
  regionId,
  children,
  className = '',
  style,
  zIndex = 8,
}: Props) {
  const layout = useDesktopNotificationsLayout();
  const rect: DesktopNotificationsPercentRect = getDesktopNotificationsRect(layout, regionId);

  return (
    <DesktopRoomCoverRectAnchor
      measureRef={measureRef}
      image={DESKTOP_NOTIFICATIONS_IMAGE}
      imageRect={desktopNotificationsRectToImageRect(rect)}
      zIndex={zIndex}
      className={className}
      style={{ pointerEvents: 'auto', overflow: 'hidden', ...style }}
    >
      {children}
    </DesktopRoomCoverRectAnchor>
  );
}
