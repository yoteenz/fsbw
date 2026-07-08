/**
 * Reputation schema — workplace trust and professional standing.
 */

import type { ProfessionId } from '../types';

export type ReputationDimension =
  | 'client-trust'
  | 'mentor-confidence'
  | 'team-reliability'
  | 'safety-compliance'
  | 'business-judgment';

export type ReputationSignal = {
  id: string;
  dimension: ReputationDimension;
  delta: number;
  summary: string;
  recordedAt: string;
  sceneId?: string;
};

export type ReputationProfile = {
  learnerId: string;
  professionId: ProfessionId;
  overallScore: number;
  dimensions: Record<ReputationDimension, number>;
  signals: ReputationSignal[];
};

const DEFAULT_DIMENSIONS: Record<ReputationDimension, number> = {
  'client-trust': 50,
  'mentor-confidence': 50,
  'team-reliability': 50,
  'safety-compliance': 50,
  'business-judgment': 50,
};

export function createInitialReputationProfile(
  learnerId: string,
  professionId: ProfessionId
): ReputationProfile {
  return {
    learnerId,
    professionId,
    overallScore: 50,
    dimensions: { ...DEFAULT_DIMENSIONS },
    signals: [],
  };
}

export function applyReputationDelta(
  profile: ReputationProfile,
  input: { dimension: ReputationDimension; delta: number; summary: string; sceneId?: string }
): ReputationProfile {
  const now = new Date().toISOString();
  const nextDimension = Math.min(100, Math.max(0, profile.dimensions[input.dimension] + input.delta));
  const dimensions = { ...profile.dimensions, [input.dimension]: nextDimension };
  const overallScore = Math.round(
    Object.values(dimensions).reduce((sum, value) => sum + value, 0) / Object.values(dimensions).length
  );

  return {
    ...profile,
    overallScore,
    dimensions,
    signals: [
      ...profile.signals,
      {
        id: `${now}-reputation`,
        dimension: input.dimension,
        delta: input.delta,
        summary: input.summary,
        recordedAt: now,
        sceneId: input.sceneId,
      },
    ],
  };
}
