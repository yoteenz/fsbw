/** FS Trend Intelligence — shared canonical vocabulary. */

export const TREND_MOMENTUM_VALUES = [
  'watching',
  'emerging',
  'rising',
  'accelerating',
  'steady',
  'peaking',
  'cooling',
  'fading',
] as const;

export type TrendMomentum = (typeof TREND_MOMENTUM_VALUES)[number];

export const FORECAST_HORIZON_VALUES = ['now', 'next', 'on_our_radar'] as const;
export type ForecastHorizon = (typeof FORECAST_HORIZON_VALUES)[number];

export const EDITORIAL_CONFIDENCE_VALUES = ['low', 'medium', 'medium_high', 'high'] as const;
export type EditorialConfidence = (typeof EDITORIAL_CONFIDENCE_VALUES)[number];

export const SOURCE_RELIABILITY_VALUES = ['high', 'medium', 'low', 'unknown'] as const;
export type SourceReliability = (typeof SOURCE_RELIABILITY_VALUES)[number];

export const AUTOMATION_STATUS_VALUES = ['manual', 'available', 'planned', 'disabled'] as const;
export type AutomationStatus = (typeof AUTOMATION_STATUS_VALUES)[number];

export const TREND_CATEGORIES = [
  'texture',
  'color',
  'lace',
  'hairline',
  'install',
  'style',
  'silhouette',
  'part',
  'volume',
  'care',
  'customization',
] as const;

export type TrendCategory = (typeof TREND_CATEGORIES)[number];

export const SOURCE_LAYER_TYPES = [
  'search',
  'social',
  'editorial',
  'culture',
  'retail',
  'fs_first_party',
  'manual',
] as const;

export type SourceLayerType = (typeof SOURCE_LAYER_TYPES)[number];

export const CANDIDATE_STATUS_VALUES = [
  'detected',
  'watchlist',
  'approved',
  'dismissed',
  'merged',
] as const;

export type CandidateStatus = (typeof CANDIDATE_STATUS_VALUES)[number];

export const FORECAST_CALL_STATUS_VALUES = [
  'draft',
  'approved',
  'published',
  'rejected',
  'archived',
] as const;

export type ForecastCallStatus = (typeof FORECAST_CALL_STATUS_VALUES)[number];

export const OUTCOME_STATUS_VALUES = [
  'hit',
  'partial',
  'still_developing',
  'early',
  'missed',
] as const;

export type OutcomeStatus = (typeof OUTCOME_STATUS_VALUES)[number];

export const SCORING_VERSION = 'heuristic-v1' as const;
export const SCORING_VERSION_LABEL = 'EDITORIAL HEURISTIC V1';

export const DISMISS_REASONS = [
  'short_lived_meme',
  'irrelevant_to_fs',
  'duplicate',
  'insufficient_evidence',
  'off_audience',
  'source_unreliable',
  'other',
] as const;

export type DismissReason = (typeof DISMISS_REASONS)[number];

export function momentumDisplayLabel(momentum: TrendMomentum): string {
  return momentum.toUpperCase().replace(/_/g, ' ');
}

export function momentumArrow(momentum: TrendMomentum): string {
  switch (momentum) {
    case 'accelerating':
      return '↑↑';
    case 'rising':
    case 'emerging':
      return '↑';
    case 'steady':
    case 'peaking':
      return '→';
    case 'cooling':
      return '↓';
    case 'fading':
      return '↓↓';
    default:
      return '·';
  }
}
