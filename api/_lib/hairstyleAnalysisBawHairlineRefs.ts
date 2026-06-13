/**
 * BAW hairline forehead-edge shapes for Fal — PEAK/LAGOS use 2D ref IMAGEs;
 * NATURAL uses text guide only. Paths match `bawStaticMannequinReferencePaths.ts`.
 */

import { displayHairline } from './hairstyleAnalysisDisplay.js';

/** Keep in sync with `src/utils/bawStaticMannequinReferencePaths.ts` (NOIR_PEAK / NOIR_LAGOS front). */
const BAW_HAIRLINE_FRONT_PATH: Record<'PEAK' | 'LAGOS', string> = {
  PEAK: '/assets/peak front.png',
  LAGOS: '/assets/lagos front.png',
};

export type BawHairlineRefKey = 'PEAK' | 'LAGOS';

export type HairstyleAnalysisHairlineRef = {
  key: BawHairlineRefKey;
  /** 1-based index in Fal image_urls */
  imageIndex: number;
  /** Site-relative or absolute public URL */
  publicPath: string;
};

export type BawHairlineShapeKey = 'NATURAL' | 'PEAK' | 'LAGOS' | 'LAGOS_PEAK';

const HAIRLINE_SHAPE_LINES: Record<BawHairlineShapeKey, string> = {
  NATURAL:
    'NATURAL — smooth wide convex arc; soft rounded center at part (no V); gentle temple curves; clean lace-front edge (no wisps on skin).',
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

/** Unique BAW hairline refs needed across all looks (max two: PEAK + LAGOS). */
export function collectHairlineRefsForAnalysis(
  looks: Array<{ hairline: string }>,
  startImageIndex: number
): HairstyleAnalysisHairlineRef[] {
  const seen = new Set<BawHairlineRefKey>();
  const refs: HairstyleAnalysisHairlineRef[] = [];
  let next = startImageIndex;

  for (const look of looks) {
    const key = bawHairlineRefKeyFromManifest(look.hairline);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    refs.push({
      key,
      imageIndex: next++,
      publicPath: bawHairlineFrontMannequinPath(key),
    });
  }

  return refs;
}

export function hairlineRefForLook(
  refs: HairstyleAnalysisHairlineRef[],
  hairlineRaw: string
): HairstyleAnalysisHairlineRef | null {
  const key = bawHairlineRefKeyFromManifest(hairlineRaw);
  if (!key) return null;
  return refs.find((r) => r.key === key) ?? null;
}

export function bawHairlineRefListBlock(refs: HairstyleAnalysisHairlineRef[]): string {
  if (refs.length === 0) return '';
  const lines = refs.map((r) => {
    const comboNote = r.key === 'PEAK' ? ' (PEAK or LAGOS + PEAK manifests)' : ' (LAGOS-only manifest)';
    return `IMAGE ${r.imageIndex} = BAW 2D ${r.key} hairline${comboNote} — **forehead lace-edge geometry only**; IMAGE 2 keeps face, skin, neck, pose; **no baby hairs on skin**.`;
  });
  return [
    '=== BAW HAIRLINE REFERENCE IMAGES (MANDATORY FOR PEAK / LAGOS) ===',
    'When manifest HAIRLINE is PEAK, LAGOS, or LAGOS + PEAK: copy **forehead edge shape** from the matching IMAGE below.',
    'Hairline IMAGE = lace-edge silhouette only — never copy face, neck, baby hairs, or wispy frizz onto the client.',
    ...lines,
  ].join('\n');
}

/** Text-only binding when no ref IMAGE (NATURAL) or as supplement for LAGOS+PEAK on PEAK ref. */
export function hairlineShapePromptLine(hairlineRaw: string): string {
  const key = hairlineShapeKeyFromManifest(hairlineRaw);
  const label = displayHairline(hairlineRaw);
  if (key === 'NATURAL') {
    return `HAIRLINE ${label}: smooth arc — clean edge, no wisps on skin.`;
  }
  if (key === 'LAGOS_PEAK') {
    return `HAIRLINE ${label}: LAGOS+PEAK — center V + side scallops (PEAK ref + text guide); not NATURAL arc.`;
  }
  return `HAIRLINE ${label}: ${key} edge per text guide — visibly not NATURAL arc.`;
}

export function hairlineRefPromptLine(
  hairlineRaw: string,
  color: string,
  refs: HairstyleAnalysisHairlineRef[]
): string {
  const ref = hairlineRefForLook(refs, hairlineRaw);
  if (!ref) return hairlineShapePromptLine(hairlineRaw);
  const label = displayHairline(hairlineRaw);
  const colorKey = color.trim().toUpperCase();
  const combo =
    hairlineShapeKeyFromManifest(hairlineRaw) === 'LAGOS_PEAK'
      ? ' — center V from ref + Lagos scallops on sides per text guide'
      : '';
  return `HAIRLINE ${label}: IMAGE ${ref.imageIndex} (${ref.key}) lace-edge shape${combo}; recolor ${colorKey}; clean edge, no baby hairs.`;
}

/** Per-look hairline binding — prefers ref IMAGE when PEAK/LAGOS. */
export function hairlineBindingPromptLine(
  hairlineRaw: string,
  color: string,
  refs: HairstyleAnalysisHairlineRef[]
): string {
  return hairlineRefPromptLine(hairlineRaw, color, refs);
}

/** Authoritative block — Fal must not invent baby hairs at the lace-front edge. */
export function noInventedBabyHairsBlock(): string {
  return [
    '=== HAIRLINE EDGE — NO BABY HAIRS (CRITICAL) ===',
    '**FORBIDDEN:** baby hairs, wispy flyaways, edge fuzz, micro-strands, glued wisps, or temple frizz on forehead/temple **skin**.',
    'Lace-front edge = **clean sharp line** where installed hair meets skin — not a fuzzy halo.',
    'Do NOT copy wispy edges from mannequin, styling, or hairline reference IMAGEs onto skin.',
    '**ERASE** any forehead edge fuzz from IMAGE 2 — do not preserve, retint, or add wisps on skin.',
  ].join('\n');
}

/** Static forehead-edge shape guide — supplements ref IMAGEs; NATURAL has no ref IMAGE. */
export function bawHairlineShapeGuideBlock(): string {
  return [
    '=== HAIRLINE TEXT GUIDE ===',
    HAIRLINE_SHAPE_LINES.NATURAL,
    HAIRLINE_SHAPE_LINES.PEAK,
    HAIRLINE_SHAPE_LINES.LAGOS,
    HAIRLINE_SHAPE_LINES.LAGOS_PEAK,
    'PEAK=center V; LAGOS=scallop; NATURAL=smooth arc — never default all to NATURAL; no baby hairs on skin.',
  ].join('\n');
}
