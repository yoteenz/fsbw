import type { CSSProperties, ReactNode, RefObject } from 'react';
import { DESKTOP_GRAND_LOBBY_IMAGE } from '../../constants/desktopGrandLobby';
import {
  desktopGrandLobbyRectToImageRect,
  getDesktopGrandLobbyRect,
} from '../../constants/desktopGrandLobbyLayout';
import type { DesktopGrandLobbyPanelRegionId } from '../../types/desktopGrandLobby';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import { DESKTOP_GRAND_LOBBY_LAYOUT_SEED } from '../../constants/desktopGrandLobbyLayout';

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
  const rect = getDesktopGrandLobbyRect(DESKTOP_GRAND_LOBBY_LAYOUT_SEED, regionId);

  return (
    <DesktopRoomCoverRectAnchor
      measureRef={measureRef}
      image={DESKTOP_GRAND_LOBBY_IMAGE}
      imageRect={desktopGrandLobbyRectToImageRect(rect)}
      zIndex={zIndex}
      className={className}
      style={{ pointerEvents: 'auto', overflow: 'hidden', ...style }}
    >
      {children}
    </DesktopRoomCoverRectAnchor>
  );
}
