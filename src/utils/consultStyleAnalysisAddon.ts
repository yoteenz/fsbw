/**
 * Wig consult — optional Style Analysis add-on (non-refundable).
 * Priced by comparison-option count: 1 / 4 → $20 / $60, bundled with $40 deposit at checkout.
 */
import type { StyleAnalysisComparisonTier } from '../types/styleAnalysis';

export type ConsultStyleAnalysisSelection = StyleAnalysisComparisonTier | null;

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
      'YOUR INSPO HAIRSTYLE ON YOU + 1 ALTERNATE COLOR IN THE SAME STYLE. DELIVERED WITH YOUR CONSULT QUOTE.',
  },
  {
    comparisonCount: 4,
    priceUsd: 60,
    label: '4 COMPARISONS',
    description:
      'YOUR INSPO HAIRSTYLE ON YOU + 4 ALTERNATE COLORS IN THE SAME STYLE (COLOR ONLY — NOT LENGTH OR CUT). DELIVERED WITH YOUR CONSULT QUOTE.',
  },
];

export const CONSULT_STYLE_ANALYSIS_NON_REFUNDABLE_NOTE =
  'STYLE ANALYSIS ADD-ON FEES ARE NON-REFUNDABLE AND ARE NOT INCLUDED IN THE $40 CONSULT DEPOSIT CREDIT WHEN YOU CLAIM YOUR OFFER.';

export function consultStyleAnalysisTierByCount(
  count: StyleAnalysisComparisonTier | null | undefined
): ConsultStyleAnalysisTierDef | null {
  if (count !== 1 && count !== 4) return null;
  return CONSULT_STYLE_ANALYSIS_TIERS.find((t) => t.comparisonCount === count) ?? null;
}

export function consultStyleAnalysisUsd(
  count: ConsultStyleAnalysisSelection | undefined
): number {
  return consultStyleAnalysisTierByCount(count ?? undefined)?.priceUsd ?? 0;
}

export function consultCheckoutTotalUsd(
  comparisonCount: ConsultStyleAnalysisSelection | undefined
): number {
  return CONSULT_DEPOSIT_USD + consultStyleAnalysisUsd(comparisonCount);
}

export function consultStyleAnalysisBagSubtitle(
  comparisonCount: ConsultStyleAnalysisSelection | undefined
): string | undefined {
  const tier = consultStyleAnalysisTierByCount(comparisonCount ?? undefined);
  if (!tier) return undefined;
  return `STYLE ANALYSIS · ${tier.label}`;
}

export function hasConsultStyleAnalysisAddon(
  comparisonCount: ConsultStyleAnalysisSelection | undefined
): comparisonCount is StyleAnalysisComparisonTier {
  return comparisonCount === 1 || comparisonCount === 4;
}
