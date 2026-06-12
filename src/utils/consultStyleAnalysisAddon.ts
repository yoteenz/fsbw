/**
 * Wig consult — optional Style Analysis add-on (non-refundable).
 * Priced by comparison-option count: 1 / 4 → $20 / $60.
 */
import type { StyleAnalysisComparisonTier } from '../types/styleAnalysis';

export const CONSULT_DEPOSIT_USD = 40;

export type ConsultStyleAnalysisTierDef = {
  comparisonCount: StyleAnalysisComparisonTier;
  priceUsd: number;
  label: string;
  description: string;
};

export const CONSULT_STYLE_ANALYSIS_TIERS: ConsultStyleAnalysisTierDef[] = [
  {
    comparisonCount: 1,
    priceUsd: 20,
    label: '1 COMPARISON',
    description:
      'YOUR INSPO LOOK ON YOU + 1 ALTERNATE COLOR OR LENGTH TO COMPARE. DELIVERED WITH YOUR CONSULT QUOTE.',
  },
  {
    comparisonCount: 4,
    priceUsd: 60,
    label: '4 COMPARISONS',
    description:
      'YOUR INSPO LOOK ON YOU + 4 ALTERNATE COLORS & LENGTHS TO COMPARE. DELIVERED WITH YOUR CONSULT QUOTE.',
  },
];

export const CONSULT_STYLE_ANALYSIS_NON_REFUNDABLE_NOTE =
  'STYLE ANALYSIS ADD-ON FEES ARE NON-REFUNDABLE. THE $40 CONSULT DEPOSIT REMAINS CREDITABLE TOWARD YOUR UNIT OR INSTALL WHEN REDEEMED PER POLICY.';

export function consultStyleAnalysisTierByCount(
  count: StyleAnalysisComparisonTier | null | undefined
): ConsultStyleAnalysisTierDef | null {
  if (count !== 1 && count !== 4) return null;
  return CONSULT_STYLE_ANALYSIS_TIERS.find((t) => t.comparisonCount === count) ?? null;
}

export function consultStyleAnalysisUsd(
  count: StyleAnalysisComparisonTier | null | undefined
): number {
  return consultStyleAnalysisTierByCount(count)?.priceUsd ?? 0;
}

export function consultCheckoutTotalUsd(
  comparisonCount: StyleAnalysisComparisonTier | null | undefined
): number {
  return CONSULT_DEPOSIT_USD + consultStyleAnalysisUsd(comparisonCount);
}

export function consultStyleAnalysisBagSubtitle(
  comparisonCount: StyleAnalysisComparisonTier | null | undefined
): string | undefined {
  const tier = consultStyleAnalysisTierByCount(comparisonCount);
  if (!tier) return undefined;
  return `STYLE ANALYSIS · ${tier.label}`;
}
