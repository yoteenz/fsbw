import type { PerformanceSnapshot, TrustScoreBreakdown } from './types';

export function calculateTrustScore(
  performance: PerformanceSnapshot,
  platformHistoryScore = 80,
  communicationScore?: number
): TrustScoreBreakdown {
  const responsiveness = Math.min(100, Math.round(performance.responsiveness * 100));
  const completionRate = Math.min(100, Math.round(performance.completionRate * 100));
  const quality = Math.min(100, Math.round(performance.quality * 100));
  const timeliness = Math.min(100, Math.round(performance.timeliness * 100));
  const clientSatisfaction = Math.min(100, Math.round(performance.clientSatisfaction * 100));
  const communication = communicationScore ?? Math.round((responsiveness + clientSatisfaction) / 2);
  const repeatBusiness = Math.min(100, Math.round(performance.repeatBusinessRate * 100));
  const platformHistory = Math.min(100, platformHistoryScore);

  const overall =
    Math.round(
      (responsiveness * 0.12 +
        completionRate * 0.14 +
        quality * 0.16 +
        timeliness * 0.12 +
        clientSatisfaction * 0.14 +
        communication * 0.1 +
        repeatBusiness * 0.12 +
        platformHistory * 0.1) *
        10
    ) / 10;

  return {
    overall,
    responsiveness,
    completionRate,
    quality,
    timeliness,
    clientSatisfaction,
    communication,
    repeatBusiness,
    platformHistory,
  };
}
