import { useLayoutEffect, useState } from 'react';
import { sceneCarouselCoverMetrics } from '../utils/sceneCarouselBackground';

export type LobbyLoungeTransitionLetterboxLayout = {
  frameWidth: number;
  frameHeight: number;
  topBandPx: number;
  bottomBandPx: number;
};

/**
 * Portrait frame metrics from slide `cover` math (928×1680).
 * @deprecated Transition media uses full viewport ({@link lobbyLoungeTransitionMediaShellStyle});
 * kept for debug / future frame tooling.
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

function computeLetterboxLayout(): LobbyLoungeTransitionLetterboxLayout {
  if (typeof window === 'undefined') {
    return { frameWidth: 360, frameHeight: 640, topBandPx: 0, bottomBandPx: 0 };
  }

  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const { renderedWidth, renderedHeight } = sceneCarouselCoverMetrics(vw, vh);

  return {
    frameWidth: renderedWidth,
    frameHeight: renderedHeight,
    topBandPx: 0,
    bottomBandPx: Math.max(0, vh - renderedHeight),
  };
}
