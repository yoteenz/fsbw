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
  cardsTopOffsetPx: 120,
  cardsMaxWidthPx: 520,
  cardScale: 0.45,
  /** Collapsed IDNTY/BLDR icon render size on desktop (px). 80 base × 0.75 (−25%) × 0.7 (−30%) = 42. */
  panelIconSizePx: 42,
  /** @deprecated Use panelIconSizePx — kept for reference: 42/80 = 0.525 */
  panelIconScale: 0.525,
  /** Expanded IDNTY/BLDR panel — centered over plaza (same anchor as collapsed cards). */
  expandedMaxWidthPx: 680,
  /** Expanded panel visual scale (1 = full; 0.875 = prior 0.7 × 1.25). Desktop only via CSS. */
  expandedPanelScale: 0.875,
  /** Framework pillar PNG size on expanded panels (32px base × 1.2). */
  frameworkIconSizePx: 38.4,
  /** Gap above “YOU ARE AT 00.00 ORIGIN POINT” on desktop hero (px). */
  coordinateGapPx: 6,
} as const;

/** @deprecated Use SITE00_ORIGIN_DESKTOP_COMPOSITION */
export const SITE00_ORIGIN_DESKTOP_CARDS = SITE00_ORIGIN_DESKTOP_COMPOSITION;
