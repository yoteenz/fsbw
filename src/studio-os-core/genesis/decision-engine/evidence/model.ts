import type { ConfidenceLevel } from '../constants';
import type { DecisionEvidenceRecord } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createEvidenceId(): string {
  return `EVD-${Date.now().toString(36)}`;
}

/** Evidence Model™ — source-backed support for decisions */
export function createDecisionEvidence(input: {
  sourceObjectId: string;
  summary: string;
  confidence?: ConfidenceLevel;
  relevance?: string;
}): DecisionEvidenceRecord {
  return {
    evidenceId: createEvidenceId(),
    sourceObjectId: input.sourceObjectId,
    confidence: input.confidence ?? 'medium',
    summary: input.summary.trim(),
    relevance: input.relevance,
    createdAt: now(),
  };
}

export function scoreEvidenceQuality(evidence: DecisionEvidenceRecord[]): {
  averageScore: number;
  level: ConfidenceLevel;
} {
  if (evidence.length === 0) {
    return { averageScore: 0, level: 'low' };
  }

  const weights: Record<ConfidenceLevel, number> = {
    low: 0.25,
    medium: 0.5,
    high: 0.75,
    verified: 1,
  };

  const total = evidence.reduce((sum, e) => sum + weights[e.confidence], 0);
  const averageScore = total / evidence.length;

  let level: ConfidenceLevel = 'low';
  if (averageScore >= 0.85) level = 'verified';
  else if (averageScore >= 0.65) level = 'high';
  else if (averageScore >= 0.4) level = 'medium';

  return { averageScore, level };
}

export function mergeEvidenceRecords(
  existing: DecisionEvidenceRecord[],
  additional: DecisionEvidenceRecord[]
): DecisionEvidenceRecord[] {
  const ids = new Set(existing.map((e) => e.evidenceId));
  const merged = [...existing];
  for (const record of additional) {
    if (!ids.has(record.evidenceId)) {
      merged.push(record);
      ids.add(record.evidenceId);
    }
  }
  return merged;
}
