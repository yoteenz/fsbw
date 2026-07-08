import type { OrbFocusMode, OrbRecommendation, OrbRecommendationCategory } from './types';

const FOCUS_CATEGORY_WEIGHT: Record<OrbFocusMode, Partial<Record<OrbRecommendationCategory, number>>> = {
  executive: {
    'approve-generation': 3,
    'visit-department': 2,
    'optimize-budget': 2,
    'continue-work': 1,
    'surprise-discovery': -2,
    'celebrate-milestone': -1,
  },
  creative: {
    'continue-work': 3,
    'review-golden-build': 2,
    'generate-department': 2,
    'surprise-discovery': 2,
    'optimize-budget': -1,
    'archive-asset': 0,
  },
  builder: {
    'generate-department': 3,
    'expand-headquarters': 2,
    'approve-generation': 2,
    'reuse-asset': 1,
    'surprise-discovery': -1,
  },
  explorer: {
    'surprise-discovery': 4,
    'start-expedition': 3,
    'review-golden-build': 1,
    'purchase-blueprint': 1,
    'approve-generation': -1,
  },
  growth: {
    'expand-headquarters': 4,
    'start-expedition': 3,
    'generate-department': 2,
    'purchase-blueprint': 2,
    'archive-asset': -1,
  },
  launch: {
    'continue-work': 4,
    'approve-generation': 3,
    'visit-department': 2,
    'celebrate-milestone': 1,
    'surprise-discovery': -2,
    'start-expedition': -2,
  },
};

const PRIORITY_BASE: Record<string, number> = {
  critical: 400,
  high: 300,
  medium: 200,
  low: 100,
};

/** Filter and re-rank recommendations for the active Focus Mode™. */
export function applyOrbFocusMode(
  recommendations: OrbRecommendation[],
  focusMode: OrbFocusMode
): OrbRecommendation[] {
  const weights = FOCUS_CATEGORY_WEIGHT[focusMode];

  return [...recommendations]
    .map((rec) => {
      const catWeight = weights[rec.category] ?? 0;
      const score = PRIORITY_BASE[rec.priority] + catWeight * 40 + rec.confidenceScore;
      return { rec, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ rec }) => rec);
}

export function filterOrbRecommendationsForFocus(
  recommendations: OrbRecommendation[],
  focusMode: OrbFocusMode
): OrbRecommendation[] {
  const ranked = applyOrbFocusMode(recommendations, focusMode);
  if (focusMode === 'executive') {
    return ranked.filter((r) => r.priority === 'critical' || r.priority === 'high').slice(0, 6);
  }
  if (focusMode === 'launch') {
    return ranked
      .filter(
        (r) =>
          r.category === 'continue-work' ||
          r.category === 'approve-generation' ||
          r.category === 'visit-department'
      )
      .slice(0, 8);
  }
  return ranked.slice(0, 10);
}
