import { readLiveValidationSystemStore } from '../persistence';
import type { LvsSystemConfidenceReading } from '../types';

/** System Confidence Engine™ — trust, verification burden, recommendation acceptance */
export function listConfidenceReadings(systemId?: string): LvsSystemConfidenceReading[] {
  const readings = readLiveValidationSystemStore().confidenceReadings;
  const filtered = systemId ? readings.filter((r) => r.systemId === systemId) : readings;
  return [...filtered].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );
}

export function getLatestConfidenceReading(
  systemId: string
): LvsSystemConfidenceReading | undefined {
  return listConfidenceReadings(systemId)[0];
}

export function computeConfidenceScore(systemId: string, baseScore: number): LvsSystemConfidenceReading {
  const escapes = readLiveValidationSystemStore().escapeEvents.filter(
    (e) => e.systemId === systemId && e.classification === 'low-trust'
  ).length;

  const confidenceScore = Math.max(0, Math.min(100, baseScore - escapes * 5));
  const trustBurden = Math.max(0, Math.min(100, 100 - confidenceScore));
  const verificationRate = Math.min(100, trustBurden * 0.6);
  const recommendationAcceptRate = Math.min(100, confidenceScore * 0.85);

  return {
    readingId: `confidence-${systemId}-${Date.now()}`,
    systemId,
    confidenceScore,
    trustBurden,
    verificationRate,
    recommendationAcceptRate,
    recordedAt: new Date().toISOString(),
  };
}
