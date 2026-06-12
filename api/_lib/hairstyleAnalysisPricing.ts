/** Standalone hairstyle analysis purchase tiers — same USD as wig consult style analysis add-on. */
export type HairstyleAnalysisComparisonTier = 1 | 4;

export const HAIRSTYLE_ANALYSIS_COMPARISON_USD: Record<HairstyleAnalysisComparisonTier, number> = {
  1: 20,
  4: 60,
};

export const HAIRSTYLE_ANALYSIS_PURCHASE_TIERS: Array<{
  comparisonCount: HairstyleAnalysisComparisonTier;
  priceUsd: number;
  label: string;
}> = [
  { comparisonCount: 1, priceUsd: 20, label: '1 COMPARISON' },
  { comparisonCount: 4, priceUsd: 60, label: '4 COMPARISONS' },
];

export function hairstyleAnalysisComparisonUsd(count: unknown): number {
  if (count === 1 || count === 4) return HAIRSTYLE_ANALYSIS_COMPARISON_USD[count];
  return 0;
}

export function parseHairstyleAnalysisComparisonTier(raw: unknown): HairstyleAnalysisComparisonTier | null {
  if (raw === 1 || raw === 4) return raw;
  return null;
}
