import { getOrganizationFounderCognitiveLoadProfile } from '../founder-cognitive-load/store';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import type { FounderIntelligenceSnapshot, PersonalDashboardMetrics } from './types';

export function buildPersonalDashboardMetrics(
  organizationId: string,
  intelligence: FounderIntelligenceSnapshot[]
): PersonalDashboardMetrics {
  const cognitive = getOrganizationFounderCognitiveLoadProfile(organizationId);
  const health = getOrganizationHealthIndexProfile(organizationId);

  const getScore = (dim: FounderIntelligenceSnapshot['dimension']) =>
    intelligence.find((s) => s.dimension === dim)?.scorePct ?? 65;

  const decisionLoad = getScore('decision-fatigue');
  const meetingEffectiveness = getScore('meeting-load');
  const strategicTime = getScore('strategic-time');
  const creativeMomentum = getScore('creative-cycles');
  const stressScore = getScore('stress-indicators');
  const focusScore = cognitive?.focusProtectionPct ?? getScore('focus-patterns');
  const leadershipGrowth = getScore('leadership-development');
  const learningProgress = getScore('learning-goals');

  const burnoutRisk = Math.min(
    95,
    Math.round(
      (decisionLoad * 0.35 +
        (100 - meetingEffectiveness) * 0.25 +
        (100 - stressScore) * 0.25 +
        (100 - strategicTime) * 0.15) *
        0.9
    )
  );

  return {
    leadershipGrowthPct: leadershipGrowth,
    focusScorePct: focusScore,
    decisionLoadPct: decisionLoad,
    executiveHealthPct: health?.executiveHealthScore ?? Math.round((stressScore + focusScore) / 2),
    learningProgressPct: learningProgress,
    delegationOpportunities: decisionLoad >= 65 ? 3 : decisionLoad >= 50 ? 2 : 1,
    meetingEffectivenessPct: meetingEffectiveness,
    strategicTimePct: strategicTime,
    burnoutRiskPct: burnoutRisk,
    creativeMomentumPct: creativeMomentum,
  };
}

export function summarizePersonalDashboard(metrics: PersonalDashboardMetrics): string {
  return [
    `Focus ${metrics.focusScorePct}% · Leadership growth ${metrics.leadershipGrowthPct}% · Burnout risk ${metrics.burnoutRiskPct}%.`,
    `${metrics.delegationOpportunities} delegation opportunities · strategic time ${metrics.strategicTimePct}%.`,
    'Personal dashboard complements the Organization Dashboard — operates the founder.',
  ].join(' ');
}
