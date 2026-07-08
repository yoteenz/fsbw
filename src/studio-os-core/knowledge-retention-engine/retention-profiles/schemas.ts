import type { KnowledgeRetentionProfile, RetentionCertificationStatus } from '../types';

type LegacyProfileFields = {
  recallStrength?: number;
  successfulApplications?: number;
};

export function normalizeRetentionProfile(
  profile: KnowledgeRetentionProfile & LegacyProfileFields
): KnowledgeRetentionProfile {
  const lastPracticed = profile.lastPracticed ?? profile.lastRealUsageAt;
  const applicationsCompleted =
    profile.applicationsCompleted ?? profile.successfulApplications ?? 0;
  const recallScore = profile.recallScore ?? profile.recallStrength ?? 70;

  return {
    ...profile,
    profession: profile.profession ?? 'beauty-professional',
    lastPracticed,
    lastRealUsageAt: profile.lastRealUsageAt ?? lastPracticed,
    recallScore,
    applicationsCompleted,
    mistakesMade: profile.mistakesMade ?? 0,
    industryVersion: profile.industryVersion ?? '2026.1',
    certificationStatus: profile.certificationStatus ?? inferCertificationStatus(profile),
    careerRelevance: profile.careerRelevance ?? profile.certificationRelevance ?? 50,
  };
}

function inferCertificationStatus(
  profile: KnowledgeRetentionProfile & LegacyProfileFields
): RetentionCertificationStatus {
  if ((profile.certificationRelevance ?? 0) < 40) return 'not-applicable';
  if ((profile.certificationRelevance ?? 0) >= 85) return 'renewal-due';
  if ((profile.certificationRelevance ?? 0) >= 70) return 'expiring-soon';
  return 'current';
}

export function touchRetentionProfile(
  profile: KnowledgeRetentionProfile,
  patch: Partial<KnowledgeRetentionProfile> = {}
): KnowledgeRetentionProfile {
  return normalizeRetentionProfile({ ...profile, ...patch });
}

export function recordProfilePractice(
  profile: KnowledgeRetentionProfile,
  options: { simulated?: boolean; mistake?: boolean } = {}
): KnowledgeRetentionProfile {
  const now = new Date().toISOString();
  return touchRetentionProfile(profile, {
    lastPracticed: now,
    lastRealUsageAt: options.simulated ? profile.lastRealUsageAt : now,
    lastSimulated: options.simulated ? now : profile.lastSimulated,
    applicationsCompleted: options.mistake
      ? profile.applicationsCompleted
      : profile.applicationsCompleted + 1,
    mistakesMade: options.mistake ? profile.mistakesMade + 1 : profile.mistakesMade,
    confidenceScore: Math.min(100, profile.confidenceScore + (options.mistake ? -2 : 3)),
    recallScore: Math.min(100, profile.recallScore + (options.mistake ? -1 : 2)),
  });
}

export function recordProfileReviewCompletion(
  profile: KnowledgeRetentionProfile,
  confidenceDelta: number,
  recallDelta: number
): KnowledgeRetentionProfile {
  return touchRetentionProfile(profile, {
    confidenceScore: Math.min(100, Math.max(0, profile.confidenceScore + confidenceDelta)),
    recallScore: Math.min(100, Math.max(0, profile.recallScore + recallDelta)),
    lastPracticed: new Date().toISOString(),
  });
}
