import type { RefObject } from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';
import {
  LOBBY_CASE_PROP_PHONE_OPEN_OVERLAY_SCALE,
  scaleLobbyCasePropOpenOverlayRect,
} from '../../constants/finalLobbyCasePropOverlays';
import { LOBBY_CASE_PROP_OPEN_OVERLAY_Z_INDEX } from '../../constants/lobbyPaymentIcons';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import { rectToPercentStyle } from './SceneHitRegion';

type Props = {
  visible: boolean;
  src: string;
  /** Normalized rect on `final-lobby.png` (928×1680). Ignored when `fillParent`. */
  imageRect?: FinalSceneHitRect;
  viewportMeasureRef?: RefObject<HTMLElement | null>;
  /** Moves open PNG in tandem with the popover (legacy slide-absolute path only). */
  layoutOffset?: { x: number; y: number };
  overlayScale?: number;
  /** Fills the display-case slot from {@link LobbyDisplayCaseShell}. */
  fillParent?: boolean;
};

const openArtImgStyle = {
  objectFit: 'cover' as const,
  objectPosition: 'center bottom',
  zIndex: LOBBY_CASE_PROP_OPEN_OVERLAY_Z_INDEX,
  pointerEvents: 'none' as const,
  userSelect: 'none' as const,
  opacity: 1,
};

/**
 * Open-state register/phone art above the slide scrim, aligned to the composite
 * via the display-case shell or legacy per-prop cover map.
 */
export function LobbyCasePropOpenArt({
  visible,
  src,
  imageRect,
  viewportMeasureRef,
  layoutOffset,
  overlayScale = LOBBY_CASE_PROP_PHONE_OPEN_OVERLAY_SCALE,
  fillParent = false,
}: Props) {
  const mapped = useSceneCoverHitRect(
    imageRect ?? { left: 0, top: 0, width: 1, height: 1 },
    viewportMeasureRef ?? { current: null },
    fillParent ? undefined : layoutOffset,
  );

  if (!visible) return null;

  const displayRect = fillParent
    ? scaleLobbyCasePropOpenOverlayRect({ left: 0, top: 0, width: 1, height: 1 }, overlayScale)
    : mapped
      ? scaleLobbyCasePropOpenOverlayRect(mapped, overlayScale)
      : null;

  if (!displayRect) return null;

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      decoding="sync"
      fetchPriority="high"
      aria-hidden
      style={{
        position: 'absolute',
        ...rectToPercentStyle(displayRect),
        ...openArtImgStyle,
      }}
    />
  );
}
