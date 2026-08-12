import type { SourceLayerType, TrendMomentum } from './constants.js';
import type { TrendCandidateRow, TrendRawSignalRow } from './types.js';

export type ScoringWeights = {
  searchVelocityWeight?: number;
  socialVelocityWeight?: number;
  editorialCoverageWeight?: number;
  culturalEventWeight?: number;
  firstPartyWeight?: number;
  persistenceWeight?: number;
  crossSourceWeight?: number;
};

export type ConfidenceExplanation = {
  strengths: string[];
  concerns: string[];
};

export function mapSourceTypeToLayer(sourceType: string): SourceLayerType {
  const normalized = sourceType.toLowerCase();
  if (normalized.includes('search')) return 'search';
  if (normalized.includes('social') || normalized.includes('tiktok') || normalized.includes('instagram')) {
    return 'social';
  }
  if (normalized.includes('editorial') || normalized.includes('publication')) return 'editorial';
  if (normalized.includes('culture') || normalized.includes('celebrity') || normalized.includes('event')) {
    return 'culture';
  }
  if (normalized.includes('retail') || normalized.includes('market')) return 'retail';
  if (normalized.includes('fs') || normalized.includes('first_party') || normalized.includes('behavior')) {
    return 'fs_first_party';
  }
  return 'manual';
}

export function computeSourceLayerCoverage(rawSignals: Pick<TrendRawSignalRow, 'source_type'>[]): SourceLayerType[] {
  const layers = new Set<SourceLayerType>();
  for (const signal of rawSignals) {
    layers.add(mapSourceTypeToLayer(signal.source_type));
  }
  return [...layers];
}

export function computeCrossSourceScore(layerCount: number, weights: ScoringWeights = {}): number {
  const weight = weights.crossSourceWeight ?? 0.1;
  if (layerCount <= 0) return 0;
  if (layerCount === 1) return Math.min(0.35, weight);
  if (layerCount === 2) return Math.min(0.6, weight * 3);
  if (layerCount === 3) return Math.min(0.8, weight * 5);
  return Math.min(1, weight * 7);
}

export function computeNumericVelocity(
  observed: number | null | undefined,
  previous: number | null | undefined,
): number | null {
  if (observed == null || previous == null || previous === 0) return null;
  return (observed - previous) / Math.abs(previous);
}

export function deriveMomentumFromSignals(
  rawSignals: Pick<
    TrendRawSignalRow,
    'change_percent' | 'qualitative_strength' | 'observed_value' | 'previous_value'
  >[],
  editorialMomentum?: TrendMomentum,
): TrendMomentum {
  if (editorialMomentum) return editorialMomentum;

  const velocities = rawSignals
    .map((s) => {
      if (s.change_percent != null) return s.change_percent / 100;
      return computeNumericVelocity(s.observed_value, s.previous_value);
    })
    .filter((v): v is number => v != null);

  if (velocities.length === 0) {
    const qual = rawSignals.find((s) => s.qualitative_strength)?.qualitative_strength?.toLowerCase();
    if (qual?.includes('accelerat')) return 'accelerating';
    if (qual?.includes('ris')) return 'rising';
    if (qual?.includes('cool')) return 'cooling';
    if (qual?.includes('fad')) return 'fading';
    return 'watching';
  }

  const avg = velocities.reduce((a, b) => a + b, 0) / velocities.length;
  if (avg >= 0.35) return 'accelerating';
  if (avg >= 0.12) return 'rising';
  if (avg <= -0.25) return 'fading';
  if (avg <= -0.08) return 'cooling';
  if (Math.abs(avg) < 0.05) return 'steady';
  return 'emerging';
}

export function computeSignalStrengthLabel(
  candidate: Pick<
    TrendCandidateRow,
    'cross_source_score' | 'persistence_score' | 'editorial_confidence' | 'source_layer_coverage'
  >,
): 'weak' | 'moderate' | 'strong' | 'insufficient' {
  const layers = candidate.source_layer_coverage?.length ?? 0;
  if (layers === 0) return 'insufficient';
  const cross = candidate.cross_source_score ?? computeCrossSourceScore(layers);
  const persistence = candidate.persistence_score ?? 0;
  const score = cross * 0.55 + persistence * 0.45;
  if (score >= 0.65) return 'strong';
  if (score >= 0.35) return 'moderate';
  return 'weak';
}

export function deriveEditorialConfidence(
  candidate: Pick<TrendCandidateRow, 'source_layer_coverage' | 'signal_strength' | 'editorial_confidence'>,
  rawCount: number,
): ConfidenceExplanation & { confidence: 'low' | 'medium' | 'medium_high' | 'high' } {
  if (candidate.editorial_confidence) {
    return {
      confidence: candidate.editorial_confidence,
      strengths: ['Editorial confidence set by reviewer'],
      concerns: [],
    };
  }

  const layers = candidate.source_layer_coverage ?? [];
  const strengths: string[] = [];
  const concerns: string[] = [];

  if (layers.length >= 3) strengths.push(`${layers.length} source layers`);
  else if (layers.length === 2) strengths.push('2 source layers');
  else concerns.push('Single-source signal');

  if (rawCount >= 3) strengths.push(`${rawCount} evidence entries`);
  else if (rawCount < 2) concerns.push('Limited evidence volume');

  const strength = candidate.signal_strength ?? computeSignalStrengthLabel({
    ...candidate,
    cross_source_score: computeCrossSourceScore(layers.length),
  });

  if (strength === 'strong') strengths.push('Composite strength: STRONG');
  if (strength === 'weak') concerns.push('Composite strength: WEAK');

  let confidence: 'low' | 'medium' | 'medium_high' | 'high' = 'medium';
  if (layers.length >= 4 && strength === 'strong') confidence = 'high';
  else if (layers.length >= 3 && strength !== 'weak') confidence = 'medium_high';
  else if (layers.length <= 1) confidence = 'low';

  return { confidence, strengths, concerns };
}

export function recalculateCandidateScores(
  candidate: TrendCandidateRow,
  rawSignals: TrendRawSignalRow[],
  weights: ScoringWeights = {},
): Partial<TrendCandidateRow> {
  const coverage = computeSourceLayerCoverage(rawSignals);
  const crossSourceScore = computeCrossSourceScore(coverage.length, weights);
  const momentum = deriveMomentumFromSignals(rawSignals, candidate.current_momentum);
  const signalStrength = computeSignalStrengthLabel({
    ...candidate,
    cross_source_score: crossSourceScore,
    source_layer_coverage: coverage,
  });

  const observedDates = rawSignals.map((s) => new Date(s.observed_at).getTime()).filter(Number.isFinite);
  let persistenceScore: number | null = null;
  if (observedDates.length >= 2) {
    const spanDays = (Math.max(...observedDates) - Math.min(...observedDates)) / 86400000;
    persistenceScore = Math.min(1, spanDays / 21);
  }

  return {
    source_layer_coverage: coverage,
    cross_source_score: crossSourceScore,
    current_momentum: momentum,
    signal_strength: signalStrength.toUpperCase(),
    persistence_score: persistenceScore,
    last_observed_at:
      observedDates.length > 0
        ? new Date(Math.max(...observedDates)).toISOString()
        : candidate.last_observed_at,
    first_observed_at:
      candidate.first_observed_at ??
      (observedDates.length > 0 ? new Date(Math.min(...observedDates)).toISOString() : null),
  };
}
