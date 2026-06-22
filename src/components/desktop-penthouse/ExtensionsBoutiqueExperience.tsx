import { useCallback, useState, type RefObject } from 'react';
import {
  EXTENSIONS_BOUTIQUE_ART_HEIGHT,
  EXTENSIONS_BOUTIQUE_ART_WIDTH,
  EXTENSIONS_WALL_HOTSPOT_RECT,
} from '../../constants/desktopExtensionsBoutique';
import { useDesktopRoomCoverHitRect } from '../../hooks/useDesktopRoomCoverHitRect';
import { ExtensionsBoutiqueHotspot } from './ExtensionsBoutiqueHotspot';
import { ExtensionsBoutiqueShopPanel } from './ExtensionsBoutiqueShopPanel';
import './extensionsBoutique.css';

type Props = {
  viewportMeasureRef: RefObject<HTMLElement | null>;
  active: boolean;
};

export function ExtensionsBoutiqueExperience({ viewportMeasureRef, active }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);

  const hotspotRect = useDesktopRoomCoverHitRect(
    EXTENSIONS_WALL_HOTSPOT_RECT,
    viewportMeasureRef,
    EXTENSIONS_BOUTIQUE_ART_WIDTH,
    EXTENSIONS_BOUTIQUE_ART_HEIGHT,
  );

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  if (!active) return null;

  return (
    <div className="extensions-boutique-layer" aria-hidden={false}>
      {hotspotRect && !panelOpen ? (
        <ExtensionsBoutiqueHotspot rect={hotspotRect} onActivate={openPanel} />
      ) : null}
      <ExtensionsBoutiqueShopPanel isOpen={panelOpen} onClose={closePanel} />
    </div>
  );
}
