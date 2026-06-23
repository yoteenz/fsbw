import { useCallback, useRef, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL,
  isPenthouseSuiteHotspotDebugEnabled,
  PENTHOUSE_SUITE_IMAGE,
  PENTHOUSE_SUITE_PANELS,
  type PenthouseSuitePanelDef,
  type PenthouseSuitePopupId,
} from '../../constants/desktopPenthouseSuite';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import { PenthouseSuiteHotspot } from './PenthouseSuiteHotspot';
import './DesktopPenthouseSuiteScene.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  onOpenPopup: (popup: PenthouseSuitePopupId) => void;
};

export function DesktopPenthouseSuiteScene({ measureRef, onOpenPopup }: Props) {
  const navigate = useNavigate();
  const layerRef = useRef<HTMLDivElement>(null);
  const debug = isPenthouseSuiteHotspotDebugEnabled();

  const handleActivate = useCallback(
    (panel: PenthouseSuitePanelDef) => {
      if (panel.action.type === 'popup') {
        onOpenPopup(panel.action.popup);
        return;
      }
      navigate(panel.action.href);
    },
    [navigate, onOpenPopup],
  );

  return (
    <div className="desktop-penthouse-suite-scene" aria-label="The Penthouse Suite account dashboard">
      <img
        src={DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL}
        alt=""
        className="desktop-penthouse-suite-scene__bg"
        draggable={false}
        width={PENTHOUSE_SUITE_IMAGE.width}
        height={PENTHOUSE_SUITE_IMAGE.height}
      />
      <div ref={layerRef} className="desktop-penthouse-suite-scene__layer">
        <div className="desktop-penthouse-suite-scene__hotspots">
          {PENTHOUSE_SUITE_PANELS.map((panel) => (
            <DesktopRoomCoverRectAnchor
              key={panel.id}
              measureRef={measureRef}
              imageRect={panel.rect}
              image={PENTHOUSE_SUITE_IMAGE}
              zIndex={5}
            >
              <PenthouseSuiteHotspot panel={panel} onActivate={handleActivate} debug={debug} />
            </DesktopRoomCoverRectAnchor>
          ))}
        </div>
      </div>
    </div>
  );
}
