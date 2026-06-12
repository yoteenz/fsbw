/** Supabase static hairstyle analysis template PNGs (2048×2560, 4:5). */
const ANALYSIS_TEMPLATE_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Analysis';

export type HairstyleAnalysisCardTier = 'free' | 'three_month' | 'six_month' | 'twelve_month';

export const HAIRSTYLE_ANALYSIS_TEMPLATE_URLS: Record<HairstyleAnalysisCardTier, string> = {
  free: `${ANALYSIS_TEMPLATE_BASE}/IMG_2438.png`,
  three_month: `${ANALYSIS_TEMPLATE_BASE}/IMG_2447.png`,
  six_month: `${ANALYSIS_TEMPLATE_BASE}/IMG_2450.png`,
  twelve_month: `${ANALYSIS_TEMPLATE_BASE}/IMG_2451.png`,
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
