import { useLayoutEffect, useState } from 'react';
import type React from 'react';
import {
  SCENE_CAROUSEL_BG_HEIGHT,
  SCENE_CAROUSEL_BG_WIDTH,
  sceneCarouselBackgroundArtHeightCss,
  sceneCarouselSlideMinHeightCss,
} from './sceneCarouselBackground';

/** `landing2-background.png` pixel size — reference for future scene hotspots. */
export const LOUNGE_BG_REFERENCE_WIDTH = SCENE_CAROUSEL_BG_WIDTH;
export const LOUNGE_BG_REFERENCE_HEIGHT = SCENE_CAROUSEL_BG_HEIGHT;

/** Vertical position of salon chair bases on the background art (0–1 from top). */
export const LOUNGE_SALON_CHAIRS_FLOOR_Y_RATIO = 0.538;

/** Rendered height when background is `background-size: 100% auto`. */
export function loungeBackgroundArtHeightCss(): string {
  return sceneCarouselBackgroundArtHeightCss();
}

/** Lounge slide must be at least viewport and full art height so floor anchors work. */
export function loungePageMinHeightCss(): string {
  return sceneCarouselSlideMinHeightCss();
}

/** Lounge salon chairs placement (inline styles on lounge page — not index.css). */
export const LOUNGE_SALON_CHAIRS_LARGE_MIN_WIDTH_PX = 1024;
/** Default Y nudge from viewport center (mobile / tablet). */
export const LOUNGE_SALON_CHAIRS_OFFSET_Y_PX = 290;
/** Extra downward nudge on large screens only (added to {@link LOUNGE_SALON_CHAIRS_OFFSET_Y_PX}). */
export const LOUNGE_SALON_CHAIRS_LARGE_EXTRA_Y_PX = 82;
/** Y offset on large screens (1024px+). */
export const LOUNGE_SALON_CHAIRS_OFFSET_Y_LARGE_PX =
  LOUNGE_SALON_CHAIRS_OFFSET_Y_PX + LOUNGE_SALON_CHAIRS_LARGE_EXTRA_Y_PX;
export const LOUNGE_SALON_CHAIRS_HEIGHT_PX = 160;
export const LOUNGE_SALON_CHAIRS_OFFSET_X_PX = 25;

export function useLoungeLargeViewport(): boolean {
  const [isLarge, setIsLarge] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(min-width: ${LOUNGE_SALON_CHAIRS_LARGE_MIN_WIDTH_PX}px)`).matches;
  });

  useLayoutEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LOUNGE_SALON_CHAIRS_LARGE_MIN_WIDTH_PX}px)`);
    const update = () => setIsLarge(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isLarge;
}

/** Anchor box for salon chairs — must be inline (index.css used !important and blocked TS/CSS var updates). */
export function loungeSalonChairsAnchorStyle(isLargeViewport: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    zIndex: 10,
    width: 'fit-content',
  };

  if (!isLargeViewport) {
    return {
      ...base,
      top: '50%',
      transform: `translate(calc(-50% + ${LOUNGE_SALON_CHAIRS_OFFSET_X_PX}px), calc(-50% + ${LOUNGE_SALON_CHAIRS_OFFSET_Y_PX}px))`,
    };
  }

  return {
    ...base,
    top: `calc(${loungeBackgroundArtHeightCss()} * ${LOUNGE_SALON_CHAIRS_FLOOR_Y_RATIO})`,
    transform: `translate(calc(-50% + ${LOUNGE_SALON_CHAIRS_OFFSET_X_PX}px), calc(-100% + ${LOUNGE_SALON_CHAIRS_LARGE_EXTRA_Y_PX}px))`,
  };
}

export function loungeSalonChairsImageStyle(): React.CSSProperties {
  return {
    width: 'auto',
    height: LOUNGE_SALON_CHAIRS_HEIGHT_PX,
    margin: 0,
    padding: 0,
    display: 'block',
    cursor: 'pointer',
  };
}
