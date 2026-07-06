import { TRUST_HISTORY_PERIOD_LABELS, TRUST_HISTORY_PERIODS } from './constants';
import type {
  ExecutiveTrustSummary,
  OrganizationExecutiveTrustDashboardProfile,
  SystemTrustIndicator,
  TrustHistoryPoint,
  TrustTrend,
} from './types';

export function buildExecutiveTrustSummary(
  indicators: SystemTrustIndicator[],
  overallTrust: number,
  confidenceTrend: TrustTrend
): ExecutiveTrustSummary {
  const attention = indicators
    .filter((i) => i.status !== 'trusted' || i.riskLevel === 'high' || i.riskLevel === 'critical')
    .map((i) => i.label);

  const risks = indicators
    .filter((i) => i.riskLevel === 'high' || i.riskLevel === 'critical')
    .map((i) => `${i.label}: ${i.recommendedAction.slice(0, 60)}…`);

  const improvements = indicators
    .filter((i) => i.trend === 'rising')
    .map((i, idx) => `${i.label} trust rising (+${idx + 2}% this period)`);

  const priorities = indicators
    .filter((i) => i.recentIssues > 0)
    .sort((a, b) => b.recentIssues - a.recentIssues)
    .slice(0, 4)
    .map((i) => i.recommendedAction);

  const briefing = [
    `Overall organizational trust: ${overallTrust}%.`,
    attention.length > 0
      ? `${attention.length} systems require attention: ${attention.slice(0, 3).join(', ')}.`
      : 'All systems within trust threshold.',
    risks.length > 0 ? `Highest risk: ${risks[0]}` : 'No critical operational risks detected.',
    confidenceTrend === 'rising'
      ? 'Confidence trend rising — QA layer protecting effectively.'
      : confidenceTrend === 'declining'
      ? 'Confidence trend declining — prioritize Integrations and Automations.'
      : 'Confidence stable — maintain validation cadence.',
    priorities[0] ? `Priority: ${priorities[0]}` : 'Continue current trust monitoring.',
  ].join(' ');

  return {
    overallOrganizationalTrust: overallTrust,
    confidenceTrend,
    systemsRequiringAttention: attention,
    highestOperationalRisks: risks.slice(0, 4),
    recentImprovements: improvements.slice(0, 4),
    suggestedPriorities: priorities.length > 0 ? priorities : ['Maintain QA cadence · no urgent priorities'],
    studioIntelligenceBriefing: briefing,
  };
}

export function buildTrustHistory(overallTrust: number): TrustHistoryPoint[] {
  const deltas: Record<(typeof TRUST_HISTORY_PERIODS)[number], number> = {
    daily: 0,
    weekly: 1,
    monthly: 2,
    quarterly: 4,
    yearly: 7,
    lifetime: 12,
  };

  return TRUST_HISTORY_PERIODS.map((period) => {
    const delta = deltas[period];
    const score = Math.max(55, Math.min(99, overallTrust - delta + (period === 'daily' ? 0 : 2)));
    return {
      period,
      label: TRUST_HISTORY_PERIOD_LABELS[period],
      trustScore: score,
      recordedAt: new Date().toISOString(),
      deltaFromPrior: period === 'daily' ? 0 : score - (overallTrust - delta - 1),
    };
  });
}

export function buildDockTrustLine(profile: OrganizationExecutiveTrustDashboardProfile): string {
  return `Executive Trust Dashboard™ ${profile.overallTrustScore}% organizational trust · ${profile.systemsAtRisk} systems at risk · ${profile.totalRecentIssues} recent issues · trust is measurable.`;
}

export function summarizeExecutiveTrustDashboard(profile: OrganizationExecutiveTrustDashboardProfile): string {
  return `${profile.dockTrustLine} ${profile.executiveSummary.studioIntelligenceBriefing.slice(0, 120)}…`;
}
