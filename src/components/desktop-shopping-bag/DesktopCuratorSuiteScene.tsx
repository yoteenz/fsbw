import type { ReactNode, RefObject } from 'react';
import {
  DESKTOP_SHOPPING_BAG_BACKGROUND_URL,
  DESKTOP_SHOPPING_BAG_IMAGE,
} from '../../constants/desktopShoppingBag';
import type { PerspectivePanelId } from '../../types/perspectivePanel';
import { PerspectivePanel } from '../perspective-panel/PerspectivePanel';
import { PerspectivePanelPageDebugOverlays } from '../perspective-panel/PerspectivePanelPageDebugOverlays';
import { DesktopRoomAmbientOverlay } from '../desktop-lobby/DesktopRoomAmbientOverlay';
import './DesktopShoppingBag.css';
import './acrylicGlass.css';
import './DesktopAcquisition.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  panelId?: Extract<PerspectivePanelId, 'curator-tablet' | 'checkout-tablet'>;
  tabletClassName?: string;
  tabletEntering?: boolean;
};

export function DesktopCuratorSuiteScene({
  measureRef,
  children,
  panelId = 'curator-tablet',
  tabletClassName = '',
  tabletEntering = false,
}: Props) {
  const perspectivePage = panelId === 'checkout-tablet' ? 'acquisition' : 'shopping-bag';
  const tabletShellClass = [
    'curated-tablet',
    'acrylic-glass-surface',
    tabletEntering ? 'curated-tablet--acquisition-enter' : '',
    tabletClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="desktop-shopping-bag-scene" aria-label="Curator collection suite">
      <DesktopRoomAmbientOverlay active />
      <img
        src={DESKTOP_SHOPPING_BAG_BACKGROUND_URL}
        alt=""
        className="desktop-shopping-bag-scene__bg"
        draggable={false}
        width={DESKTOP_SHOPPING_BAG_IMAGE.width}
        height={DESKTOP_SHOPPING_BAG_IMAGE.height}
      />
      <div className="desktop-shopping-bag-scene__layer">
        <PerspectivePanel
          id={panelId}
          measureRef={measureRef}
          image={DESKTOP_SHOPPING_BAG_IMAGE}
          zIndex={6}
          className={tabletShellClass}
          style={{ pointerEvents: 'auto' }}
        >
          {children}
        </PerspectivePanel>
        <PerspectivePanelPageDebugOverlays
          measureRef={measureRef}
          page={perspectivePage}
          image={DESKTOP_SHOPPING_BAG_IMAGE}
        />
      </div>
    </div>
  );
}
