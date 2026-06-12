/** Supabase static hairstyle analysis template PNGs (2048×2560, 4:5). */
const ANALYSIS_TEMPLATE_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Analysis';

export const HAIRSTYLE_ANALYSIS_FREE_TEMPLATE_URL = `${ANALYSIS_TEMPLATE_BASE}/IMG_2554.png`;
export const HAIRSTYLE_ANALYSIS_PREMIUM_TEMPLATE_URL = `${ANALYSIS_TEMPLATE_BASE}/IMG_2549.png`;

export type HairstyleAnalysisCardTier = 'free' | 'three_month' | 'six_month' | 'twelve_month';

/** Two physical templates: free (top match only) + premium (top + 3 additional matches for all paid tiers). */
export const HAIRSTYLE_ANALYSIS_TEMPLATE_URLS: Record<HairstyleAnalysisCardTier, string> = {
  free: HAIRSTYLE_ANALYSIS_FREE_TEMPLATE_URL,
  three_month: HAIRSTYLE_ANALYSIS_PREMIUM_TEMPLATE_URL,
  six_month: HAIRSTYLE_ANALYSIS_PREMIUM_TEMPLATE_URL,
  twelve_month: HAIRSTYLE_ANALYSIS_PREMIUM_TEMPLATE_URL,
};

export function normalizeHairstyleAnalysisCardTier(
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

export function hairstyleAnalysisTemplateUrlForTier(tier: string): string {
  return HAIRSTYLE_ANALYSIS_TEMPLATE_URLS[normalizeHairstyleAnalysisCardTier(tier)];
}
