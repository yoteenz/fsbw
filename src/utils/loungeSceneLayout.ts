/** `landing2-background.png` pixel size — used for vw-scaled hotspot placement. */
export const LOUNGE_BG_REFERENCE_WIDTH = 1560;
export const LOUNGE_BG_REFERENCE_HEIGHT = 3376;
export const LOUNGE_BG_HEIGHT_PER_VW = LOUNGE_BG_REFERENCE_HEIGHT / LOUNGE_BG_REFERENCE_WIDTH;

/** Scaled background height when `background-size: 100% auto` (width = viewport). */
export function loungeBackgroundHeightCss(): string {
  return `calc(100vw * ${LOUNGE_BG_HEIGHT_PER_VW})`;
}

/**
 * Salon chairs: Y from page top where chair bases meet the floor line in the artwork.
 * Tune this ratio if the scene asset changes.
 */
export const LOUNGE_SALON_CHAIRS_FLOOR_Y_RATIO = 0.538;

export function loungeSalonChairsTopCss(): string {
  return `calc(${loungeBackgroundHeightCss()} * ${LOUNGE_SALON_CHAIRS_FLOOR_Y_RATIO})`;
}

/** Chair art scales with scene width (reference height 160px at 1560px-wide art). */
export function loungeSalonChairsHeightCss(): string {
  const heightVw = (160 / LOUNGE_BG_REFERENCE_WIDTH) * 100;
  return `clamp(108px, ${heightVw.toFixed(3)}vw, 200px)`;
}

/** Horizontal nudge (reference +25px at 1560px-wide). */
export function loungeSalonChairsOffsetXCss(): string {
  const xVw = (25 / LOUNGE_BG_REFERENCE_WIDTH) * 100;
  return `calc(-50% + ${xVw.toFixed(3)}vw)`;
}
