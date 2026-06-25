import type { RefObject } from 'react';
import { DesktopRoomAmbientOverlay } from '../desktop-lobby/DesktopRoomAmbientOverlay';
import { PENTHOUSE_PANEL_DEBUG_PANELS } from '../../constants/desktopPenthousePanelDebugConfig';
import {
  DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL,
  PENTHOUSE_SUITE_IMAGE,
} from '../../constants/desktopPenthouseSuite';
import { DesktopPanelDebugLayer } from '../desktop-panel-debug/DesktopPanelDebugLayer';
import { DesktopPanelDebugProvider } from '../desktop-panel-debug/DesktopPanelDebugProvider';
import { isPanelDebugModeEnabled } from '../../utils/desktopPanelDebugMode';
import { PerspectivePanelPageDebugOverlays } from '../perspective-panel/PerspectivePanelPageDebugOverlays';
import { PenthouseSuiteDashboard } from './PenthouseSuiteDashboard';
import './DesktopPenthouseSuiteScene.css';
import '../desktop-panel-debug/desktopPanelDebug.css';
import '../desktop-shared/acrylicGlass.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  user: Record<string, unknown> | null;
};

export function DesktopPenthouseSuiteScene({ measureRef, user }: Props) {
  const panelDebug = isPanelDebugModeEnabled();

  return (
    <DesktopPanelDebugProvider sceneId="penthouse" panels={PENTHOUSE_PANEL_DEBUG_PANELS}>
      <div className="desktop-penthouse-suite-scene" aria-label="The Penthouse Suite account dashboard">
        <DesktopRoomAmbientOverlay active />
        <div className="desktop-penthouse-suite-scene__bg-stack" aria-hidden>
          <img
            src={DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL}
            alt=""
            className="desktop-penthouse-suite-scene__bg"
            draggable={false}
            width={PENTHOUSE_SUITE_IMAGE.width}
            height={PENTHOUSE_SUITE_IMAGE.height}
          />
        </div>
        <div className="desktop-penthouse-suite-scene__layer">
          {panelDebug ? null : (
            <PenthouseSuiteDashboard measureRef={measureRef} user={user} />
          )}
          {panelDebug ? (
            <DesktopPanelDebugLayer
              measureRef={measureRef}
              image={PENTHOUSE_SUITE_IMAGE}
              panels={PENTHOUSE_PANEL_DEBUG_PANELS}
            />
          ) : null}
          <PerspectivePanelPageDebugOverlays
            measureRef={measureRef}
            page="account"
            image={PENTHOUSE_SUITE_IMAGE}
          />
        </div>
      </div>
    </DesktopPanelDebugProvider>
  );
}
