import type { RefObject } from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';
import { LOBBY_CASE_PROP_OPEN_OVERLAY_Z_INDEX } from '../../constants/lobbyPaymentIcons';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import { rectToPercentStyle } from './SceneHitRegion';

type Props = {
  visible: boolean;
  src: string;
  /** Normalized rect on `final-lobby.png` (928×1680). */
  imageRect: FinalSceneHitRect;
  viewportMeasureRef: RefObject<HTMLElement | null>;
};

/**
 * Open-state register/phone art above the slide scrim, aligned to the composite
 * via the same cover map as the lobby background. Assets are preloaded on lobby mount.
 */
export function LobbyCasePropOpenArt({ visible, src, imageRect, viewportMeasureRef }: Props) {
  const mapped = useSceneCoverHitRect(imageRect, viewportMeasureRef);

  if (!visible || !mapped) return null;

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
        ...rectToPercentStyle(mapped),
        objectFit: 'contain',
        objectPosition: 'center bottom',
        zIndex: LOBBY_CASE_PROP_OPEN_OVERLAY_Z_INDEX,
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: 1,
      }}
    />
  );
}
