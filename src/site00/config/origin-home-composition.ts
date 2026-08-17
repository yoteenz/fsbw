/**
 * SITE 00 Origin homepage — desktop composition (approved environment).
 * Panels sit in the foreground plaza below the figure between the twin zeros.
 */

export const SITE00_ORIGIN_DESKTOP_CARDS = {
  /** Vertical anchor — % from top of home stage (above status strip). */
  topPercent: 58,
  /** Additional downward nudge from anchor (px). */
  topOffsetPx: 20,
  /** Plaza cards container max width (px). */
  maxWidth: 520,
  /** Collapsed IDNTY/BLDR card scale on desktop (1 = 100%). */
  cardScale: 0.75,
  /** Hero copy block horizontal nudge (px; negative = left). */
  heroOffsetXPx: -25,
} as const;
