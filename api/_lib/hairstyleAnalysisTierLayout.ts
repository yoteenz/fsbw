import type { HairstyleAnalysisCardTier } from './hairstyleAnalysisTemplates.js';

/** Free 1-pick template layout (TOP MATCH only) — includes hair consult 1 pick (`six_month`). */
export function isFreeLayoutHairstyleAnalysisTier(
  tier: string | null | undefined
): boolean {
  const v = String(tier ?? '')
    .trim()
    .toLowerCase();
  return v === 'free' || v === 'six_month';
}

export function isPremiumLayoutHairstyleAnalysisTier(
  tier: string | null | undefined
): boolean {
  return !isFreeLayoutHairstyleAnalysisTier(tier);
}

export function normalizeCardTierForLayout(
  tier: string | null | undefined
): HairstyleAnalysisCardTier {
  const v = String(tier ?? '')
    .trim()
    .toLowerCase();
  if (v === 'black') return 'twelve_month';
  if (v === 'free' || v === 'three_month' || v === 'six_month' || v === 'twelve_month') {
    return v;
  }
  return 'three_month';
}
