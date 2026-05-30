import { useLayoutEffect, useState } from 'react';
import type React from 'react';

/** `landing2-background.png` pixel size — reference for future scene hotspots. */
export const LOUNGE_BG_REFERENCE_WIDTH = 1560;
export const LOUNGE_BG_REFERENCE_HEIGHT = 3376;

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
  const offsetY = isLargeViewport ? LOUNGE_SALON_CHAIRS_OFFSET_Y_LARGE_PX : LOUNGE_SALON_CHAIRS_OFFSET_Y_PX;
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 10,
    width: 'fit-content',
    transform: `translate(calc(-50% + ${LOUNGE_SALON_CHAIRS_OFFSET_X_PX}px), calc(-50% + ${offsetY}px))`,
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
