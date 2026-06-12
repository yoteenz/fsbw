/** Standalone hairstyle analysis purchase tiers — same USD as wig consult style analysis add-on. */
export type HairstyleAnalysisComparisonTier = 1 | 3 | 6;

export const HAIRSTYLE_ANALYSIS_COMPARISON_USD: Record<HairstyleAnalysisComparisonTier, number> = {
  1: 20,
  3: 40,
  6: 60,
};

export const HAIRSTYLE_ANALYSIS_PURCHASE_TIERS: Array<{
  comparisonCount: HairstyleAnalysisComparisonTier;
  priceUsd: number;
  label: string;
}> = [
  { comparisonCount: 1, priceUsd: 20, label: '1 COMPARISON' },
  { comparisonCount: 3, priceUsd: 40, label: '3 COMPARISONS' },
  { comparisonCount: 6, priceUsd: 60, label: '6 COMPARISONS' },
];

export function hairstyleAnalysisComparisonUsd(count: unknown): number {
  if (count === 1 || count === 3 || count === 6) return HAIRSTYLE_ANALYSIS_COMPARISON_USD[count];
  return 0;
}

export function parseHairstyleAnalysisComparisonTier(raw: unknown): HairstyleAnalysisComparisonTier | null {
  if (raw === 1 || raw === 3 || raw === 6) return raw;
  return null;
}
