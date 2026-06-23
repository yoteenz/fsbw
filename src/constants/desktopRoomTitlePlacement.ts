/**
 * Placement on the **source hero image** (0–100%), not the viewport.
 * Runtime positions are cover-mapped via `desktopRoomCoverLayout.ts`
 * (`object-fit: cover` + `object-position: center top` in DesktopZoneRoomScene).
 */

import { getEffectiveDesktopRoomTitlePlacement } from '../utils/desktopRoomTitlePlacementOverrides';

export type DesktopRoomTitlePlacement = {
  /** Center of the red foil title block from top edge (%) */
  titleTopPct: number;
  /** Gap from title baseline to subtitle first line (px at 1920×1080 design width) */
  subtitleGapPx: number;
  /** Optional horizontal nudge from dead center (%) — all rooms centered at 0 */
  centerOffsetPct: number;
  /** Pinch scale for red title + black subtitle together (1 = design default). */
  textScale?: number;
  notes: string;
};

/**
 * Per-room placement notes from the original baked-text assets.
 * Red title + black subtitle sat on the upper center marble wall panel (center-safe band).
 */
export const DESKTOP_ROOM_TITLE_PLACEMENT: Readonly<Record<string, DesktopRoomTitlePlacement>> = {
  'analysis-lab': {
    titleTopPct: 12,
    subtitleGapPx: 10,
    centerOffsetPct: 0,
    notes: 'Red foil + black subtitle centered on back wall console bay, upper third.',
  },
  showroom: {
    titleTopPct: 12.5,
    subtitleGapPx: 10,
    centerOffsetPct: 0,
    notes: 'Title/subtitle on central marble wall above pedestal ring; symmetric columns.',
  },
  boutique: {
    titleTopPct: 12,
    subtitleGapPx: 10,
    centerOffsetPct: 0,
    notes: 'Centered over backlit extension shelves on rear wall.',
  },
  'build-a-wig-atelier': {
    titleTopPct: 11.5,
    subtitleGapPx: 10,
    centerOffsetPct: 0,
    notes: 'Centered on sample-wall bay (historically baked BUILD-A-WiG typo on wall).',
  },
  lounge: {
    titleTopPct: 12,
    subtitleGapPx: 10,
    centerOffsetPct: 0,
    notes: 'Centered above cinema screen wall; subtitle directly under foil title.',
  },
  'grand-lobby': {
    titleTopPct: 12.5,
    subtitleGapPx: 10,
    centerOffsetPct: 0,
    notes: 'Centered on grand staircase marble back wall (still on legacy IMG until NO TEXT asset).',
  },
  'slay-cam-gallery': {
    titleTopPct: 12,
    subtitleGapPx: 10,
    centerOffsetPct: 0,
    notes: 'Centered on picture-frame gallery wall, upper band.',
  },
  'members-lounge': {
    titleTopPct: 12.5,
    subtitleGapPx: 10,
    centerOffsetPct: 0,
    notes: 'Centered on crystal-table focal wall.',
  },
  'rewards-gallery': {
    titleTopPct: 12,
    subtitleGapPx: 10,
    centerOffsetPct: 0,
    notes: 'Centered on glowing niche grid wall.',
  },
  reception: {
    titleTopPct: 12.5,
    subtitleGapPx: 10,
    centerOffsetPct: 0,
    notes: 'Centered on diamond-logo marble wall between staircases.',
  },
  'founder-suite': {
    titleTopPct: 12,
    subtitleGapPx: 10,
    centerOffsetPct: 0,
    notes: 'Centered on executive desk / portrait wall bay.',
  },
  'psa-suite': {
    titleTopPct: 12,
    subtitleGapPx: 10,
    centerOffsetPct: 0,
    notes: 'Centered on glowing portal wall above advisory lounge.',
  },
};

export const DESKTOP_ROOM_TITLE_DEFAULT_PLACEMENT: DesktopRoomTitlePlacement = {
  titleTopPct: 12.5,
  subtitleGapPx: 10,
  centerOffsetPct: 0,
  notes: 'Default upper-center hero wall anchor (10–15% band).',
};

export function resolveDesktopRoomTitlePlacement(zoneId: string): DesktopRoomTitlePlacement {
  if (typeof window !== 'undefined') {
    return getEffectiveDesktopRoomTitlePlacement(zoneId);
  }
  return DESKTOP_ROOM_TITLE_PLACEMENT[zoneId] ?? DESKTOP_ROOM_TITLE_DEFAULT_PLACEMENT;
}

/** Per-room subtitle-only font nudge (px) — does not affect red foil title. */
export const DESKTOP_ROOM_SUBTITLE_FONT_OFFSET_PX: Readonly<Partial<Record<string, number>>> = {
  reception: -7,
};

export function resolveDesktopRoomSubtitleFontOffsetPx(zoneId: string): number {
  return DESKTOP_ROOM_SUBTITLE_FONT_OFFSET_PX[zoneId] ?? 0;
}
