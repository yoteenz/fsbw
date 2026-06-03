import { useLayoutEffect, useState } from 'react';
import {
  LOUNGE_TV_ANIMATION_LETTERBOX_BOUNCE_PAD_PX,
  LOUNGE_TV_ANIMATION_VIDEO_HEIGHT,
  LOUNGE_TV_ANIMATION_VIDEO_WIDTH,
} from '../constants/loungeTvAnimationVideo';

export type LoungeTvAnimationLetterboxLayout = {
  frameWidth: number;
  frameHeight: number;
  topBandPx: number;
  bottomBandPx: number;
};

/** Top-anchored portrait frame + transparent bands for full TV Seedance clip (no cover zoom). */
export function useLoungeTvAnimationLetterboxLayout(): LoungeTvAnimationLetterboxLayout {
  const [layout, setLayout] = useState<LoungeTvAnimationLetterboxLayout>(() => computeLayout());

  useLayoutEffect(() => {
    const update = () => setLayout(computeLayout());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return layout;
}

function computeLayout(): LoungeTvAnimationLetterboxLayout {
  if (typeof window === 'undefined') {
    return { frameWidth: 360, frameHeight: 640, topBandPx: 0, bottomBandPx: 0 };
  }

  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const aspect = LOUNGE_TV_ANIMATION_VIDEO_HEIGHT / LOUNGE_TV_ANIMATION_VIDEO_WIDTH;
  const frameWidth = vw;
  const frameHeight = Math.min(vh, frameWidth * aspect);
  const letterboxPx = Math.max(0, vh - frameHeight);
  const bounceHalf = LOUNGE_TV_ANIMATION_LETTERBOX_BOUNCE_PAD_PX / 2;

  return {
    frameWidth,
    frameHeight,
    topBandPx: bounceHalf,
    bottomBandPx: letterboxPx + bounceHalf,
  };
}
