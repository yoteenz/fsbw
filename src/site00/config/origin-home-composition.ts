/**
 * SITE 00 Origin homepage — desktop composition (approved environment).
 * Hero anchors over the left arch; panels sit on the plaza below the central figure.
 */

export const SITE00_ORIGIN_DESKTOP_COMPOSITION = {
  /** Hero block — % from left edge of stage (environment-aligned, not viewport padding). */
  heroLeftPercent: 11,
  heroTopPx: 16,
  heroMaxWidthPx: 360,
  /** Fine nudge after anchor (px; negative = left). */
  heroOffsetXPx: -25,
  /** Collapsed IDNTY/BLDR plaza anchor — % from top of home stage. */
  cardsTopPercent: 58,
  cardsTopOffsetPx: 140,
  cardsMaxWidthPx: 520,
  cardScale: 0.45,
  /** Expanded IDNTY/BLDR panel — centered over plaza (same anchor as collapsed cards). */
  expandedMaxWidthPx: 680,
} as const;

/** @deprecated Use SITE00_ORIGIN_DESKTOP_COMPOSITION */
export const SITE00_ORIGIN_DESKTOP_CARDS = SITE00_ORIGIN_DESKTOP_COMPOSITION;
