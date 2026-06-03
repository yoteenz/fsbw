import { useLayoutEffect, useState } from 'react';
import {
  LOBBY_LOUNGE_TRANSITION_VIDEO_HEIGHT,
  LOBBY_LOUNGE_TRANSITION_VIDEO_WIDTH,
} from '../constants/lobbyLoungeTransitionVideo';

export type LobbyLoungeTransitionLetterboxLayout = {
  frameWidth: number;
  frameHeight: number;
  topBandPx: number;
  bottomBandPx: number;
};

/**
 * Fixed top-anchored portrait frame + transparent bands (no flex center bounce).
 * {@link LOBBY_LOUNGE_TRANSITION_LETTERBOX_BOUNCE_PAD_PX} adds slack above/below the frame.
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

/** Extra transparent band (px) split above/below frame — masks vertical settle during play. */
export const LOBBY_LOUNGE_TRANSITION_LETTERBOX_BOUNCE_PAD_PX = 16;

function computeLetterboxLayout(): LobbyLoungeTransitionLetterboxLayout {
  if (typeof window === 'undefined') {
    return { frameWidth: 360, frameHeight: 640, topBandPx: 0, bottomBandPx: 0 };
  }

  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const aspect = LOBBY_LOUNGE_TRANSITION_VIDEO_HEIGHT / LOBBY_LOUNGE_TRANSITION_VIDEO_WIDTH;
  const frameWidth = vw;
  const frameHeight = Math.min(vh, frameWidth * aspect);
  const letterboxPx = Math.max(0, vh - frameHeight);
  const bounceHalf = LOBBY_LOUNGE_TRANSITION_LETTERBOX_BOUNCE_PAD_PX / 2;
  const topBandPx = bounceHalf;
  const bottomBandPx = letterboxPx + bounceHalf;

  return { frameWidth, frameHeight, topBandPx, bottomBandPx };
}
