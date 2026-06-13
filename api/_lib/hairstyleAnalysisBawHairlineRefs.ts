/**
 * BAW hairline forehead-edge shapes for Fal — described in prompt text (not reference IMAGEs).
 * Paths in BAW_HAIRLINE_FRONT_PATH kept for dev/mannequin UI parity only.
 */

import { displayHairline } from './hairstyleAnalysisDisplay.js';

/** Keep in sync with `src/utils/bawStaticMannequinReferencePaths.ts` (NOIR_PEAK / NOIR_LAGOS front). */
const BAW_HAIRLINE_FRONT_PATH: Record<'PEAK' | 'LAGOS', string> = {
  PEAK: '/assets/peak front.png',
  LAGOS: '/assets/lagos front.png',
};

export type BawHairlineRefKey = 'PEAK' | 'LAGOS';

/** @deprecated Fal no longer uploads hairline ref IMAGEs — kept for type compatibility. */
export type HairstyleAnalysisHairlineRef = {
  key: BawHairlineRefKey;
  imageIndex: number;
  publicPath: string;
};

export type BawHairlineShapeKey = 'NATURAL' | 'PEAK' | 'LAGOS' | 'LAGOS_PEAK';

const HAIRLINE_SHAPE_LINES: Record<BawHairlineShapeKey, string> = {
  NATURAL:
    'NATURAL — smooth wide convex arc; soft rounded center at part (no V); gentle temple curves; **clean lace-front edge** (no wispy strands on forehead skin).',
  PEAK:
    'PEAK — widow\'s peak: sharp center V (lowest at part), rises to temples then curves down (heart/M). Not a smooth arc.',
  LAGOS:
    'LAGOS — scalloped edge: small center bump, two side valleys, soft outer peaks (M/W wave). Not smooth arc or single center V.',
  LAGOS_PEAK:
    'LAGOS+PEAK — sharp center V plus Lagos scalloped valleys/peaks on the forehead sides.',
};

export function hairlineShapeKeyFromManifest(hairlineRaw: string): BawHairlineShapeKey {
  const h = displayHairline(hairlineRaw);
  if (!h || h === 'NATURAL') return 'NATURAL';
  const hasPeak = h.includes('PEAK');
  const hasLagos = h.includes('LAGOS');
  if (hasPeak && hasLagos) return 'LAGOS_PEAK';
  if (hasPeak) return 'PEAK';
  if (hasLagos) return 'LAGOS';
  return 'NATURAL';
}

/**
 * PEAK-only and LAGOS+PEAK → peak front (BAW `hasPeak` branch).
 * LAGOS-only → lagos front. NATURAL → no ref.
 */
export function bawHairlineRefKeyFromManifest(hairlineRaw: string): BawHairlineRefKey | null {
  const key = hairlineShapeKeyFromManifest(hairlineRaw);
  if (key === 'PEAK' || key === 'LAGOS_PEAK') return 'PEAK';
  if (key === 'LAGOS') return 'LAGOS';
  return null;
}

export function bawHairlineFrontMannequinPath(key: BawHairlineRefKey): string {
  return BAW_HAIRLINE_FRONT_PATH[key];
}

/** @deprecated Fal uses text shape guide — returns empty (no hairline IMAGEs uploaded). */
export function collectHairlineRefsForAnalysis(
  _looks: Array<{ hairline: string }>,
  _startImageIndex: number
): HairstyleAnalysisHairlineRef[] {
  return [];
}

/** Compact per-look binding — full shapes live in bawHairlineShapeGuideBlock(). */
export function hairlineShapePromptLine(hairlineRaw: string, _color: string): string {
  const key = hairlineShapeKeyFromManifest(hairlineRaw);
  const label = displayHairline(hairlineRaw);
  if (key === 'NATURAL') {
    return `HAIRLINE ${label}: NATURAL smooth arc per guide — clean edge, no baby hairs on skin.`;
  }
  return `HAIRLINE ${label}: ${key} forehead edge per guide — not NATURAL arc; no baby hairs on skin.`;
}

/** Authoritative block — Fal must not invent baby hairs at the lace-front edge. */
export function noInventedBabyHairsBlock(): string {
  return [
    '=== HAIRLINE EDGE — NO BABY HAIRS (CRITICAL) ===',
    '**FORBIDDEN:** baby hairs, wispy flyaways, edge fuzz, micro-strands, or temple frizz on forehead/temple **skin**.',
    'Lace-front edge = **clean defined line** where installed hair meets skin — not a fuzzy halo or glued-down wisps.',
    'Do NOT copy wispy edges or baby hairs from mannequin or styling IMAGEs onto the client.',
    'If IMAGE 2 already has tiny strands in the **hair region only**, retint them to catalog color — do NOT add new strands on skin.',
  ].join('\n');
}

/** Static forehead-edge shape guide — all BAW hairline types in one block. */
export function bawHairlineShapeGuideBlock(): string {
  return [
    '=== HAIRLINE EDGE — TEXT GUIDE (NO REF IMAGE) ===',
    'Lace-front forehead edge only — face/pose from IMAGE 2.',
    HAIRLINE_SHAPE_LINES.NATURAL,
    HAIRLINE_SHAPE_LINES.PEAK,
    HAIRLINE_SHAPE_LINES.LAGOS,
    HAIRLINE_SHAPE_LINES.LAGOS_PEAK,
    'PEAK = center V; LAGOS = scalloped M/W; NATURAL = smooth arc — never identical shapes.',
    'FORBIDDEN: mannequin/styling IMAGE edge geometry; inventing baby hairs; black wisps on vivid/blonde hair.',
  ].join('\n');
}

/** @deprecated Use bawHairlineShapeGuideBlock — Fal no longer attaches hairline IMAGEs. */
export function bawHairlineRefListBlock(_refs: HairstyleAnalysisHairlineRef[]): string {
  return '';
}

/** @deprecated Use hairlineShapePromptLine. */
export function hairlineRefForLook(
  _refs: HairstyleAnalysisHairlineRef[],
  hairlineRaw: string
): HairstyleAnalysisHairlineRef | null {
  const key = bawHairlineRefKeyFromManifest(hairlineRaw);
  if (!key) return null;
  return { key, imageIndex: 0, publicPath: bawHairlineFrontMannequinPath(key) };
}

/** @deprecated Use hairlineShapePromptLine. */
export function hairlineRefPromptLine(
  hairlineRaw: string,
  color: string,
  _refs: HairstyleAnalysisHairlineRef[]
): string {
  return hairlineShapePromptLine(hairlineRaw, color);
}
