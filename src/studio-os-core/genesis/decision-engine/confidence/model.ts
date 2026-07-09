import type { ConfidenceLevel } from '../constants';
import type { DecisionConfidenceRecord, DecisionEvidenceRecord } from '../types';
import { scoreEvidenceQuality } from '../evidence/model';

function now(): string {
  return new Date().toISOString();
}

/** Confidence Model™ — declared certainty for decisions */
export function buildDecisionConfidence(input: {
  score?: number;
  level?: ConfidenceLevel;
  rationale: string;
  evidence?: DecisionEvidenceRecord[];
}): DecisionConfidenceRecord {
  if (input.evidence && input.evidence.length > 0 && input.level === undefined) {
    const derived = scoreEvidenceQuality(input.evidence);
    return {
      score: input.score ?? derived.averageScore,
      level: derived.level,
      rationale: input.rationale.trim(),
      calibratedAt: now(),
    };
  }

  const level = input.level ?? 'medium';
  const defaultScores: Record<ConfidenceLevel, number> = {
    low: 0.25,
    medium: 0.5,
    high: 0.75,
    verified: 1,
  };

  return {
    score: input.score ?? defaultScores[level],
    level,
    rationale: input.rationale.trim(),
    calibratedAt: now(),
  };
}

export function requiresHumanReview(confidence: DecisionConfidenceRecord): boolean {
  return confidence.level === 'low' || confidence.score < 0.4;
}

export function requiresFounderReview(
  confidence: DecisionConfidenceRecord,
  impactLevel: 'low' | 'medium' | 'high' | 'constitutional'
): boolean {
  if (impactLevel === 'constitutional') return true;
  if (impactLevel === 'high') return confidence.level !== 'verified';
  return requiresHumanReview(confidence);
}

export function calibrateConfidenceFromOutcome(input: {
  prior: DecisionConfidenceRecord;
  outcomeMatched: boolean;
}): DecisionConfidenceRecord {
  const adjustment = input.outcomeMatched ? 0.05 : -0.1;
  const score = Math.max(0, Math.min(1, input.prior.score + adjustment));

  let level: ConfidenceLevel = 'low';
  if (score >= 0.85) level = 'verified';
  else if (score >= 0.65) level = 'high';
  else if (score >= 0.4) level = 'medium';

  return {
    score,
    level,
    rationale: `Calibrated from outcome (${input.outcomeMatched ? 'matched' : 'missed'}). ${input.prior.rationale}`,
    calibratedAt: now(),
  };
}
