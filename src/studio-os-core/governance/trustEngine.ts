import type { TrustScore } from './types';

/** Compute weighted trust score from factor breakdown (0–100). */
export function computeTrustScore(factors: TrustScore['factors']): number {
  const weights = {
    accountHistory: 0.08,
    verification: 0.12,
    projectCompletion: 0.1,
    ratings: 0.1,
    customerSatisfaction: 0.1,
    policyCompliance: 0.12,
    responseTime: 0.06,
    paymentHistory: 0.08,
    disputes: 0.08,
    quality: 0.1,
    communityContributions: 0.06,
  } as const;

  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    total += factors[key as keyof TrustScore['factors']] * weight;
  }
  return Math.round(Math.min(100, Math.max(0, total)));
}

export function averagePlatformTrust(trustScores: TrustScore[]): number {
  if (trustScores.length === 0) return 0;
  const sum = trustScores.reduce((acc, t) => acc + t.score, 0);
  return Math.round(sum / trustScores.length);
}
