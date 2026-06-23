import { useCallback, useEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import {
  EXTENSIONS_BOUTIQUE_ART_HEIGHT,
  EXTENSIONS_BOUTIQUE_ART_WIDTH,
  EXTENSIONS_WALL_HOTSPOT_RECT,
} from '../../constants/desktopExtensionsBoutique';
import { useDesktopViewportScreenHitRect } from '../../hooks/useDesktopRoomCoverHitRect';
import { ExtensionsBoutiqueHotspot } from './ExtensionsBoutiqueHotspot';
import { ExtensionsBoutiqueShopPanel } from './ExtensionsBoutiqueShopPanel';
import './extensionsBoutique.css';

type Props = {
  viewportMeasureRef: RefObject<HTMLElement | null>;
  active: boolean;
};

export function ExtensionsBoutiqueExperience({ viewportMeasureRef, active }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);

  const screenRect = useDesktopViewportScreenHitRect(
    EXTENSIONS_WALL_HOTSPOT_RECT,
    viewportMeasureRef,
    EXTENSIONS_BOUTIQUE_ART_WIDTH,
    EXTENSIONS_BOUTIQUE_ART_HEIGHT,
  );

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  useEffect(() => {
    if (!active) setPanelOpen(false);
  }, [active]);

  if (!active || typeof document === 'undefined') return null;

  return createPortal(
    <div className="extensions-boutique-portal" aria-hidden={false}>
      {screenRect && !panelOpen ? (
        <ExtensionsBoutiqueHotspot screenRect={screenRect} onActivate={openPanel} />
      ) : null}
      <ExtensionsBoutiqueShopPanel isOpen={panelOpen} onClose={closePanel} />
    </div>,
    document.body,
  );
}
