import type { KnowledgeIndustryUpdate, KnowledgeRetentionProfile, ReviewTriggerId } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(fromIso: string | undefined, now: Date): number | null {
  if (!fromIso) return null;
  const t = Date.parse(fromIso);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now.getTime() - t) / DAY_MS));
}

export function resolveReviewTriggers(
  profile: KnowledgeRetentionProfile,
  options: {
    now?: Date;
    hasIndustryUpdate?: boolean;
    daysSinceRealUsage?: number | null;
  } = {}
): ReviewTriggerId[] {
  const now = options.now ?? new Date();
  const daysSinceRealUsage =
    options.daysSinceRealUsage ?? daysBetween(profile.lastPracticed ?? profile.lastRealUsageAt, now);
  const triggers: ReviewTriggerId[] = [];

  if (daysSinceRealUsage === null || daysSinceRealUsage >= 60) triggers.push('time-elapsed');
  if (profile.confidenceScore < 70) triggers.push('low-confidence');
  if (profile.mistakesMade >= 3) triggers.push('repeated-mistakes');
  if (options.hasIndustryUpdate || profile.industryUpdateCount > 0) {
    triggers.push('industry-standard-update');
  }
  if (profile.upcomingSimulationIds.length > 0) triggers.push('upcoming-simulation');
  if (profile.careerGoalIds.length > 0 && profile.careerRelevance >= 70) {
    triggers.push('career-goal');
  }
  if (
    profile.certificationStatus === 'renewal-due' ||
    profile.certificationStatus === 'expiring-soon' ||
    profile.certificationRelevance >= 80
  ) {
    triggers.push('certification-deadline');
  }

  return triggers;
}

export function shouldRunRetentionScheduler(
  lastRunAt: string | undefined,
  intervalMs: number,
  now = new Date()
): boolean {
  if (!lastRunAt) return true;
  const last = Date.parse(lastRunAt);
  if (Number.isNaN(last)) return true;
  return now.getTime() - last >= intervalMs;
}

export function nextSchedulerRunAt(intervalMs: number, now = new Date()): string {
  return new Date(now.getTime() + intervalMs).toISOString();
}

export function filterProfilesByTrigger(
  profiles: KnowledgeRetentionProfile[],
  trigger: ReviewTriggerId,
  updates: KnowledgeIndustryUpdate[] = [],
  now = new Date()
): KnowledgeRetentionProfile[] {
  return profiles.filter((profile) => {
    const conceptUpdates = updates.some((update) => update.conceptId === profile.id);
    const triggers = resolveReviewTriggers(profile, { now, hasIndustryUpdate: conceptUpdates });
    return triggers.includes(trigger);
  });
}
