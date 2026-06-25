import type { RefObject } from 'react';
import { useEffect } from 'react';
import {
  DESKTOP_NOTIFICATIONS_BACKGROUND_URL,
  DESKTOP_NOTIFICATIONS_IMAGE,
} from '../../constants/desktopNotifications';
import { DESKTOP_NOTIFICATIONS_DEBUG_PANELS } from '../../constants/desktopNotificationsLayout';
import { preloadDesktopRoomBackground } from '../../utils/desktopRoomBackgroundCache';
import { DesktopNotificationsDebugRect } from './DesktopNotificationsDebugRect';
import { DesktopNotificationsProductionLayer } from './DesktopNotificationsProductionLayer';
import { useDesktopNotificationsDebug } from './DesktopNotificationsDebugProvider';
import { PerspectivePanelPageDebugOverlays } from '../perspective-panel/PerspectivePanelPageDebugOverlays';
import { DesktopRoomAmbientOverlay } from '../desktop-lobby/DesktopRoomAmbientOverlay';
import './DesktopNotifications.css';
import '../desktop-shared/acrylicGlass.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
};

export function DesktopNotificationsScene({ measureRef }: Props) {
  const debug = useDesktopNotificationsDebug();
  const showProduction = !debug?.debugEnabled;

  useEffect(() => {
    void preloadDesktopRoomBackground(DESKTOP_NOTIFICATIONS_BACKGROUND_URL);
  }, []);

  return (
    <div className="dn-scene" aria-label="Alerts">
      <DesktopRoomAmbientOverlay active />
      <img
        src={DESKTOP_NOTIFICATIONS_BACKGROUND_URL}
        alt=""
        className="dn-scene__bg"
        draggable={false}
        width={DESKTOP_NOTIFICATIONS_IMAGE.width}
        height={DESKTOP_NOTIFICATIONS_IMAGE.height}
      />
      <div className="dn-scene__layer">
        {showProduction ? <DesktopNotificationsProductionLayer measureRef={measureRef} /> : null}

        {debug?.debugEnabled && debug.overlaysVisible
          ? DESKTOP_NOTIFICATIONS_DEBUG_PANELS.map((panel) => (
              <DesktopNotificationsDebugRect key={panel.id} measureRef={measureRef} panel={panel} />
            ))
          : null}

        <PerspectivePanelPageDebugOverlays
          measureRef={measureRef}
          page="alerts"
          image={DESKTOP_NOTIFICATIONS_IMAGE}
        />
      </div>
    </div>
  );
}
