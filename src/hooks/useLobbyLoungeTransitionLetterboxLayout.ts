import { useLayoutEffect, useState } from 'react';
import {
  SCENE_CAROUSEL_BG_COVER_OFFSET_Y_PX,
  sceneCarouselCoverMetrics,
} from '../utils/sceneCarouselBackground';

export type LobbyLoungeTransitionLetterboxLayout = {
  frameWidth: number;
  frameHeight: number;
  topBandPx: number;
  bottomBandPx: number;
};

/**
 * Portrait frame aligned to Final LP slide `cover` math (928×1680), not raw Seedance 1080×1920.
 * Top-anchored with no bounce pad — avoids red peek-through and end-of-clip vertical bounce.
 */
export function useLobbyLoungeTransitionLetterboxLayout(): LobbyLoungeTransitionLetterboxLayout {
  const [layout, setLayout] = useState<LobbyLoungeTransitionLetterboxLayout>(() =>
    computeLetterboxLayout(),
  );

  useLayoutEffect(() => {
    const update = () => setLayout(computeLetterboxLayout());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return layout;
}

/** Pull transition frame up vs slide art so it lines up with lobby/lounge composites. */
export const LOBBY_LOUNGE_TRANSITION_FRAME_OFFSET_Y_PX = -SCENE_CAROUSEL_BG_COVER_OFFSET_Y_PX;

function computeLetterboxLayout(): LobbyLoungeTransitionLetterboxLayout {
  if (typeof window === 'undefined') {
    return { frameWidth: 360, frameHeight: 640, topBandPx: 0, bottomBandPx: 0 };
  }

  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const { renderedWidth, renderedHeight } = sceneCarouselCoverMetrics(vw, vh);
  const frameWidth = renderedWidth;
  const frameHeight = renderedHeight;
  const topBandPx = 0;
  const bottomBandPx = Math.max(0, vh - frameHeight);

  return { frameWidth, frameHeight, topBandPx, bottomBandPx };
}
