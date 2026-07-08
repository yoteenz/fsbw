import { RETENTION_ANALYTICS_WEIGHTS, STATUS_THRESHOLDS } from '../constants';
import { evaluateRetentionProfile } from '../review-engine/evaluator';
import type {
  KnowledgeIndustryUpdate,
  KnowledgeRetentionProfile,
  RetentionAnalyticsSnapshot,
  RetentionReviewRecord,
} from '../types';

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function buildRetentionAnalyticsSnapshot(input: {
  organizationId: string;
  learnerId: string;
  profiles: KnowledgeRetentionProfile[];
  industryUpdates?: KnowledgeIndustryUpdate[];
  reviewHistory?: RetentionReviewRecord[];
  now?: Date;
}): RetentionAnalyticsSnapshot {
  const now = input.now ?? new Date();
  const updates = input.industryUpdates ?? [];
  const evaluations = input.profiles.map((profile) => evaluateRetentionProfile(profile, updates, now));

  const averageConfidence =
    input.profiles.length === 0
      ? 0
      : clamp(
          input.profiles.reduce((sum, profile) => sum + profile.confidenceScore, 0) /
            input.profiles.length
        );

  const averageMastery =
    evaluations.length === 0
      ? 0
      : clamp(evaluations.reduce((sum, evaluation) => sum + evaluation.masteryScore, 0) / evaluations.length);

  const averageRetention =
    evaluations.length === 0
      ? 0
      : clamp(
          evaluations.reduce((sum, evaluation) => sum + (100 - evaluation.decayRiskScore), 0) /
            evaluations.length
        );

  const profilesNeedingRefresh = evaluations.filter(
    (evaluation) => evaluation.status !== 'fresh'
  ).length;

  const conceptDecayRisk =
    evaluations.length === 0
      ? 0
      : clamp(
          evaluations.reduce((sum, evaluation) => sum + evaluation.decayRiskScore, 0) /
            evaluations.length
        );

  const completedReviews = input.reviewHistory?.length ?? 0;
  const reviewCompletionRate = clamp(
    profilesNeedingRefresh === 0
      ? 100
      : (completedReviews / Math.max(profilesNeedingRefresh, 1)) * 100
  );

  const knowledgeGrowthScore = clamp(
    input.profiles.reduce(
      (sum, profile) => sum + profile.applicationsCompleted + profile.recallScore * 0.2,
      0
    ) / Math.max(input.profiles.length, 1)
  );

  const industryUpdatesPending = updates.filter((update) =>
    evaluations.some(
      (evaluation) =>
        evaluation.profileId === update.conceptId && evaluation.status === 'changed'
    )
  ).length;

  const weightedScore =
    averageRetention * RETENTION_ANALYTICS_WEIGHTS.retention +
    averageConfidence * RETENTION_ANALYTICS_WEIGHTS.confidence +
    averageMastery * RETENTION_ANALYTICS_WEIGHTS.mastery +
    reviewCompletionRate * RETENTION_ANALYTICS_WEIGHTS.reviewCompletion +
    knowledgeGrowthScore * RETENTION_ANALYTICS_WEIGHTS.knowledgeGrowth +
    (100 - conceptDecayRisk) * RETENTION_ANALYTICS_WEIGHTS.conceptDecay;

  return {
    learnerId: input.learnerId,
    organizationId: input.organizationId,
    generatedAt: now.toISOString(),
    profileCount: input.profiles.length,
    averageRetention,
    averageConfidence,
    averageMastery: clamp(weightedScore > 0 ? (averageMastery + weightedScore) / 2 : averageMastery),
    reviewCompletionRate,
    knowledgeGrowthScore,
    conceptDecayRisk,
    profilesNeedingRefresh,
    industryUpdatesPending,
  };
}

export function isProfileAtRisk(profile: KnowledgeRetentionProfile, riskScore: number): boolean {
  if (riskScore >= STATUS_THRESHOLDS.needsRefresh) return true;
  if (profile.confidenceScore < 65) return true;
  if (profile.recallScore < 60) return true;
  if (profile.mistakesMade >= 5) return true;
  return false;
}
