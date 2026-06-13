/**
 * BAW hairline sub-page 2D mannequin fronts — Fal reference for realistic PEAK / LAGOS
 * forehead lace-edge shape only. Paths match `bawStaticMannequinReferencePaths.ts` (NOIR).
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

/**
 * PEAK-only and LAGOS+PEAK → peak front (BAW `hasPeak` branch).
 * LAGOS-only → lagos front. NATURAL → no ref.
 */
export function bawHairlineRefKeyFromManifest(hairlineRaw: string): BawHairlineRefKey | null {
  const h = displayHairline(hairlineRaw);
  if (!h || h === 'NATURAL') return null;
  if (h.includes('PEAK')) return 'PEAK';
  if (h.includes('LAGOS')) return 'LAGOS';
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
    const comboNote = r.key === 'PEAK' ? ' (PEAK or LAGOS + PEAK)' : '';
    return `IMAGE ${r.imageIndex} = BAW 2D ${r.key} hairline${comboNote} — forehead lace-edge shape only; retint edge strands to catalog color.`;
  });
  return [
    '=== BAW HAIRLINE REFERENCE IMAGES (FOREHEAD EDGE SHAPE ONLY) ===',
    'Match manifest HAIRLINE using the IMAGE below — lace-front edge geometry only; IMAGE 2 keeps face, skin, neck, and pose.',
    ...lines,
  ].join('\n');
}

export function hairlineRefPromptLine(
  hairlineRaw: string,
  color: string,
  refs: HairstyleAnalysisHairlineRef[]
): string {
  const ref = hairlineRefForLook(refs, hairlineRaw);
  if (!ref) return '';
  const label = displayHairline(hairlineRaw);
  return `HAIRLINE ${label}: copy forehead lace-edge shape from IMAGE ${ref.imageIndex}; retint baby hairs and temple wisps to ${color.trim().toUpperCase()} — not black.`;
}
