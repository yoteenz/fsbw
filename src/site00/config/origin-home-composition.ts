/**
 * SITE 00 Origin homepage — desktop composition (approved environment @ 1440px).
 * Hero anchors over the left arch; panels sit on the plaza below the central figure.
 *
 * Layout CSS: `site00-desktop-artboard.css` (artboard shell only — no native @media duplicate).
 * Wide `/origin` and `/origin/desktop` both render via `Site00OriginRouteShell`.
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
  /** Collapsed IDNTY/BLDR icon render size on desktop (px). Prior 42px × 1.05 (+5%) = 44.1. */
  panelIconSizePx: 44.1,
  /** Collapsed panel icon nudge down inside IDNTY/BLDR cards (artboard px). Prior 10px + 6px. */
  panelIconOffsetYPx: 16,
  /** @deprecated Use panelIconSizePx — kept for reference: 44.1/80 ≈ 0.551 */
  panelIconScale: 0.551,
  /** Expanded IDNTY/BLDR panel — centered over plaza (same anchor as collapsed cards). */
  expandedMaxWidthPx: 680,
  /** Expanded panel visual scale (1 = full; 0.875 = prior 0.7 × 1.25). Desktop only via CSS. */
  expandedPanelScale: 0.875,
  /** Framework pillar PNG size on expanded panels (32px base × 1.2). */
  frameworkIconSizePx: 38.4,
  /** Offset for `.site00-home-hero__coordinate-slot` below hero copy (px). */
  coordinateOffsetYPx: 6,
} as const;

/** @deprecated Use SITE00_ORIGIN_DESKTOP_COMPOSITION */
export const SITE00_ORIGIN_DESKTOP_CARDS = SITE00_ORIGIN_DESKTOP_COMPOSITION;
