import {
  DIFFICULTY_WEIGHT,
  REFRESHER_MODES,
  STATUS_THRESHOLDS,
} from './constants';
import type {
  KnowledgeIndustryUpdate,
  KnowledgeRetentionProfile,
  LivingKnowledgeImpact,
  RefresherMode,
  RefresherModeId,
  RetentionEvaluation,
  RetentionPlan,
  RetentionStatus,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function daysBetween(fromIso: string | undefined, now: Date): number | null {
  if (!fromIso) return null;
  const t = Date.parse(fromIso);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now.getTime() - t) / DAY_MS));
}

function mode(id: RefresherModeId): RefresherMode {
  return REFRESHER_MODES.find((m) => m.id === id)!;
}

function statusFromRisk(risk: number, hasIndustryUpdate: boolean): RetentionStatus {
  if (hasIndustryUpdate) return 'changed';
  if (risk >= STATUS_THRESHOLDS.critical) return 'critical';
  if (risk >= STATUS_THRESHOLDS.needsRefresh) return 'needs-refresh';
  if (risk >= STATUS_THRESHOLDS.warming) return 'warming';
  return 'fresh';
}

function baseModesForEvaluation(
  profile: KnowledgeRetentionProfile,
  risk: number,
  hasIndustryUpdate: boolean
): RefresherMode[] {
  const modes: RefresherMode[] = [];

  if (hasIndustryUpdate) modes.push(mode('industry-update'));
  if (profile.certificationRelevance >= 80 || hasIndustryUpdate) modes.push(mode('certification-renewal'));
  if (profile.upcomingSimulationIds.length > 0) modes.push(mode('interactive-simulation'));
  if (profile.upcomingProjectIds.length > 0) modes.push(mode('client-scenario'));
  if (risk >= STATUS_THRESHOLDS.critical) modes.push(mode('mentor-demonstration'), mode('challenge-mode'));
  else if (risk >= STATUS_THRESHOLDS.needsRefresh) modes.push(mode('skill-refresh'));
  else modes.push(mode('memory-spark'));

  return modes.filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i).slice(0, 4);
}

function buildReasons(
  profile: KnowledgeRetentionProfile,
  daysSinceRealUsage: number | null,
  hasIndustryUpdate: boolean
): string[] {
  const reasons: string[] = [];

  if (daysSinceRealUsage === null) reasons.push('No real-world usage has been recorded yet.');
  else if (daysSinceRealUsage >= 180) reasons.push(`${daysSinceRealUsage} days since last real usage.`);
  else if (daysSinceRealUsage >= 60) reasons.push(`${daysSinceRealUsage} days since last real usage.`);

  if (profile.recallStrength < 65) reasons.push(`Recall strength is ${profile.recallStrength}%.`);
  if (profile.confidenceScore < 70) reasons.push(`Confidence score is ${profile.confidenceScore}%.`);
  if (hasIndustryUpdate) reasons.push('Profession Brain™ has a relevant industry update.');
  if (profile.certificationRelevance >= 80) reasons.push('Certification relevance is high.');
  if (profile.upcomingSimulationIds.length > 0) reasons.push('Upcoming simulation can refresh this memory naturally.');
  if (profile.upcomingProjectIds.length > 0) reasons.push('Upcoming real-world project can apply this memory.');

  return reasons.length ? reasons : ['Professional memory remains fresh.'];
}

export function calculateRetentionRisk(
  profile: KnowledgeRetentionProfile,
  options: { now?: Date; hasIndustryUpdate?: boolean } = {}
): number {
  const now = options.now ?? new Date();
  const daysSinceLearned = daysBetween(profile.learnedAt, now) ?? 0;
  const daysSinceRealUsage = daysBetween(profile.lastRealUsageAt, now);
  const unusedDays = daysSinceRealUsage ?? daysSinceLearned;
  const difficulty = DIFFICULTY_WEIGHT[profile.difficulty];

  const timeRisk = Math.min(42, unusedDays / 5) * difficulty;
  const weakRecallRisk = (100 - profile.recallStrength) * 0.34;
  const lowConfidenceRisk = (100 - profile.confidenceScore) * 0.24;
  const usageProtection = Math.min(24, profile.successfulApplications * 1.15);
  const certificationRisk = profile.certificationRelevance * 0.08;
  const updateRisk = (options.hasIndustryUpdate || profile.industryUpdateCount > 0) ? 18 : 0;
  const futureContextBoost =
    profile.upcomingSimulationIds.length > 0 || profile.upcomingProjectIds.length > 0 ? 8 : 0;

  return clamp(
    timeRisk +
      weakRecallRisk +
      lowConfidenceRisk +
      certificationRisk +
      updateRisk +
      futureContextBoost -
      usageProtection
  );
}

export function evaluateRetentionProfile(
  profile: KnowledgeRetentionProfile,
  updates: KnowledgeIndustryUpdate[] = [],
  now = new Date()
): RetentionEvaluation {
  const conceptUpdates = updates.filter((u) => u.conceptId === profile.id);
  const hasIndustryUpdate = conceptUpdates.length > 0;
  const daysSinceLearned = daysBetween(profile.learnedAt, now) ?? 0;
  const daysSinceRealUsage = daysBetween(profile.lastRealUsageAt, now);
  const risk = calculateRetentionRisk(profile, { now, hasIndustryUpdate });
  const masteryScore = clamp(
    profile.confidenceScore * 0.36 +
      profile.recallStrength * 0.36 +
      Math.min(100, profile.successfulApplications * 5) * 0.18 +
      (100 - risk) * 0.1
  );
  const recommendedModes = baseModesForEvaluation(profile, risk, hasIndustryUpdate);
  const status = statusFromRisk(risk, hasIndustryUpdate);
  const reasons = buildReasons(profile, daysSinceRealUsage, hasIndustryUpdate);

  return {
    profileId: profile.id,
    conceptTitle: profile.conceptTitle,
    status,
    daysSinceLearned,
    daysSinceRealUsage,
    decayRiskScore: risk,
    masteryScore,
    recommendedModes,
    orbMentorLine: buildOrbMentorLine(profile, { status, daysSinceRealUsage, hasIndustryUpdate }),
    reasons,
  };
}

export function buildOrbMentorLine(
  profile: KnowledgeRetentionProfile,
  context: { status: RetentionStatus; daysSinceRealUsage: number | null; hasIndustryUpdate: boolean }
): string {
  if (context.hasIndustryUpdate) {
    return `A new ${profile.conceptTitle.toLowerCase()} standard has been added to the profession.`;
  }

  if (profile.upcomingSimulationIds.length > 0 && context.status !== 'fresh') {
    return `Your next simulation is perfect practice for refreshing ${profile.conceptTitle.toLowerCase()}.`;
  }

  if (profile.upcomingProjectIds.length > 0 && context.status !== 'fresh') {
    return `An upcoming project is a natural way to refresh ${profile.conceptTitle.toLowerCase()}.`;
  }

  if (context.daysSinceRealUsage !== null && context.daysSinceRealUsage >= 60) {
    return `It's been ${context.daysSinceRealUsage} days since your last ${profile.conceptTitle.toLowerCase()}.`;
  }

  if (context.status === 'fresh') {
    return `${profile.conceptTitle} is holding strong. Keep applying it in real work.`;
  }

  return `You haven't used ${profile.conceptTitle.toLowerCase()} in a while. A quick memory spark would keep it alive.`;
}

export function resolveLivingKnowledgeImpacts(
  profiles: KnowledgeRetentionProfile[],
  updates: KnowledgeIndustryUpdate[]
): LivingKnowledgeImpact[] {
  return updates
    .map((update) => {
      const profile = profiles.find((p) => p.id === update.conceptId);
      if (!profile) return null;
      const recommendedMode =
        update.severity === 'certification' ? mode('certification-renewal') : mode('industry-update');

      return {
        updateId: update.id,
        conceptId: profile.id,
        conceptTitle: profile.conceptTitle,
        affectedLearnerReason: `${profile.conceptTitle} is in this learner's professional memory and is relevant to ${profile.careerGoalIds.join(', ') || 'career continuity'}.`,
        orbExplanation: {
          whatChanged: update.summary,
          whyItChanged: update.whyItChanged,
          howItAffectsWork: update.workImpact,
        },
        recommendedMode,
      };
    })
    .filter((impact): impact is LivingKnowledgeImpact => Boolean(impact));
}

export function buildRetentionPlan(
  organizationId: string,
  profiles: KnowledgeRetentionProfile[],
  updates: KnowledgeIndustryUpdate[] = [],
  now = new Date()
): RetentionPlan {
  const evaluations = profiles.map((profile) => evaluateRetentionProfile(profile, updates, now));
  const priorityQueue = evaluations
    .filter((e) => e.status !== 'fresh')
    .sort((a, b) => b.decayRiskScore - a.decayRiskScore)
    .slice(0, 8);

  return {
    organizationId,
    generatedAt: now.toISOString(),
    evaluations,
    priorityQueue,
    updateImpacts: resolveLivingKnowledgeImpacts(profiles, updates),
  };
}
