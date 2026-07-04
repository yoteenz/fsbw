/**
 * Official Frontal Slayer Display Bust v1.0 — permanent mannequin reference.
 * Uses existing background-removed mannequin assets from public/assets/ (no re-upload required).
 */

export const OFFICIAL_DISPLAY_BUST_VERSION = '1.0' as const;

export const OFFICIAL_DISPLAY_BUST_LABEL = 'Official Frontal Slayer Display Bust v1.0' as const;

export type DisplayBustTextureFamily = 'straight' | 'blanco' | 'wavy' | 'curly';

export type DisplayBustAngleSet = {
  front: string;
  left: string;
  right: string;
};

/** Qualities preserved across all product generation. */
export const OFFICIAL_DISPLAY_BUST_PRESERVE = [
  'mannequin shape',
  'gray material',
  'chest logo',
  'proportions',
  'stand hardware',
  'existing transparent cutout quality',
] as const;

/**
 * Canonical front reference — SOFT WAVE benchmark mannequin used site-wide for wavy units,
 * cart, wishlist, product cards, and Asset Factory POC.
 */
export const OFFICIAL_DISPLAY_BUST_CANONICAL_FRONT = '/assets/2D WAVY FRONT.png' as const;

/** Per-texture-family L/M/R triples — same paths as BAW static mannequin references. */
export const OFFICIAL_DISPLAY_BUST_TEXTURE_FAMILIES: Record<DisplayBustTextureFamily, DisplayBustAngleSet> = {
  straight: {
    front: '/assets/natural front.png',
    left: '/assets/natural left.png',
    right: '/assets/natural right.png',
  },
  blanco: {
    front: '/assets/2D BLANCO FRONT.png',
    left: '/assets/2D BLANCO LEFT.png',
    right: '/assets/2D BLANCO RIGHT.png',
  },
  wavy: {
    front: '/assets/2D WAVY FRONT.png',
    left: '/assets/2D WAVY LEFT.png',
    right: '/assets/2D WAVY RIGHT.png',
  },
  curly: {
    front: '/assets/2D CURLY FRONT.png',
    left: '/assets/2D CURLY LEFT.png',
    right: '/assets/2D CURLY RIGHT.png',
  },
};

/** Signature unit slug → texture family for bust resolution. */
export const DISPLAY_BUST_FAMILY_BY_UNIT_SLUG: Record<string, DisplayBustTextureFamily> = {
  noir: 'straight',
  blanco: 'blanco',
  'soft-wave': 'wavy',
  'beach-wave': 'wavy',
  'soft-curl': 'curly',
  'ocean-curl': 'curly',
};

export function resolveDisplayBustForUnitSlug(unitSlug: string): DisplayBustAngleSet {
  const family = DISPLAY_BUST_FAMILY_BY_UNIT_SLUG[unitSlug] ?? 'wavy';
  return OFFICIAL_DISPLAY_BUST_TEXTURE_FAMILIES[family];
}

export function resolveDisplayBustFrontForUnitSlug(unitSlug: string): string {
  return resolveDisplayBustForUnitSlug(unitSlug).front;
}
