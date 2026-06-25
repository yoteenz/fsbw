import type { CSSProperties, ReactNode, RefObject } from 'react';
import { DESKTOP_NOTIFICATIONS_IMAGE } from '../../constants/desktopNotifications';
import { ALERTS_REGION_TO_PERSPECTIVE_PANEL } from '../../constants/desktopPagePerspectivePanels';
import type { DesktopNotificationsRectRegionId } from '../../types/desktopNotifications';
import { DesktopPerspectivePanelAnchor } from '../desktop-shared/DesktopPerspectivePanelAnchor';

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
  return (
    <DesktopPerspectivePanelAnchor
      id={ALERTS_REGION_TO_PERSPECTIVE_PANEL[regionId]}
      measureRef={measureRef}
      image={DESKTOP_NOTIFICATIONS_IMAGE}
      className={className}
      style={style}
      zIndex={zIndex}
    >
      {children}
    </DesktopPerspectivePanelAnchor>
  );
}
