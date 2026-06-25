import type { CSSProperties, ReactNode, RefObject } from 'react';
import { DESKTOP_GRAND_LOBBY_IMAGE } from '../../constants/desktopGrandLobby';
import { GRAND_LOBBY_REGION_TO_PERSPECTIVE_PANEL } from '../../constants/desktopPagePerspectivePanels';
import type { DesktopGrandLobbyPanelRegionId } from '../../types/desktopGrandLobby';
import { DesktopPerspectivePanelAnchor } from '../desktop-shared/DesktopPerspectivePanelAnchor';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  regionId: DesktopGrandLobbyPanelRegionId;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  zIndex?: number;
};

export function GrandLobbyPanelAnchor({
  measureRef,
  regionId,
  children,
  className = '',
  style,
  zIndex = 8,
}: Props) {
  return (
    <DesktopPerspectivePanelAnchor
      id={GRAND_LOBBY_REGION_TO_PERSPECTIVE_PANEL[regionId]}
      measureRef={measureRef}
      image={DESKTOP_GRAND_LOBBY_IMAGE}
      className={className}
      style={style}
      zIndex={zIndex}
    >
      {children}
    </DesktopPerspectivePanelAnchor>
  );
}
