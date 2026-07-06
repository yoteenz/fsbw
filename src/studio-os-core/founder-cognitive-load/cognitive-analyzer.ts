import { getOrganizationAmbientAwarenessProfile } from '../ambient-awareness/store';
import { getOrganizationAnticipationProfile } from '../anticipation-engine/store';
import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { COGNITIVE_FACTOR_LABELS, COGNITIVE_FACTORS } from './constants';
import type { CognitiveFactorSnapshot } from './types';

function demandStatus(pct: number): CognitiveFactorSnapshot['status'] {
  if (pct >= 80) return 'critical';
  if (pct >= 65) return 'high';
  if (pct >= 45) return 'moderate';
  return 'low';
}

function deriveMeetingsToday(): number {
  const day = new Date().getDay();
  if (day === 0 || day === 6) return 1;
  return 2 + (day % 3);
}

export function buildCognitiveFactorSnapshots(organizationId: string): CognitiveFactorSnapshot[] {
  const pulse = getOrganizationPulseProfile(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const awareness = getOrganizationAmbientAwarenessProfile(organizationId);
  const anticipation = getOrganizationAnticipationProfile(organizationId);

  const meetings = deriveMeetingsToday();
  const pendingApprovals = council?.pendingDecisions ?? 0;
  const founder = pulse?.indicatorScores.find((i) => /founder/i.test(i.label));
  const revenue = pulse?.indicatorScores.find((i) => /revenue/i.test(i.label));
  const customer = pulse?.indicatorScores.find((i) => /customer/i.test(i.label));
  const marketing = pulse?.indicatorScores.find((i) => /marketing/i.test(i.label));

  const factorData: Record<
    (typeof COGNITIVE_FACTORS)[number],
    { demandPct: number; summary: string }
  > = {
    'calendar-density': {
      demandPct: Math.min(95, 40 + meetings * 18),
      summary: `${meetings} meeting(s) today · calendar density ${meetings >= 3 ? 'elevated' : 'manageable'}`,
    },
    'pending-approvals': {
      demandPct: Math.min(95, 30 + pendingApprovals * 15),
      summary:
        pendingApprovals > 0
          ? `${pendingApprovals} approval(s) awaiting founder decision`
          : 'No pending council approvals — decision queue clear',
    },
    'decision-fatigue': {
      demandPct: Math.min(95, 35 + pendingApprovals * 12 + (anticipation?.preparationsReady ?? 0) * 3),
      summary:
        pendingApprovals >= 3
          ? 'Multiple decisions stacking — batching recommended'
          : 'Decision load within sustainable range',
    },
    'unread-communications': {
      demandPct: Math.min(90, 25 + (awareness?.departmentSnapshots.length ?? 4) * 8),
      summary: `${awareness?.departmentSnapshots.length ?? 4} department channels active — communications summarized when load rises`,
    },
    'department-requests': {
      demandPct: Math.min(88, 30 + (awareness?.departmentSnapshots.length ?? 4) * 10),
      summary: 'Cross-department requests monitored — non-critical items deferred under high load',
    },
    'revenue-pressure': {
      demandPct: revenue ? Math.max(35, 100 - revenue.scorePct) : 55,
      summary: revenue
        ? `Revenue pulse ${revenue.scorePct}% · ${revenue.trend} momentum`
        : 'Revenue signals monitoring — pressure within normal range',
    },
    'launch-activity': {
      demandPct: blueprint ? Math.min(92, blueprint.overallProgressPct * 0.85) : 40,
      summary: blueprint
        ? `Discovery ${blueprint.overallProgressPct}% · launch activity ${blueprint.overallProgressPct >= 70 ? 'intensifying' : 'building'}`
        : 'Launch activity moderate — preparation phase',
    },
    'customer-issues': {
      demandPct: customer ? Math.max(30, 100 - customer.scorePct) : 45,
      summary: customer
        ? `Customer experience ${customer.scorePct}% · ${customer.trend} trend`
        : 'Customer issues within normal operational range',
    },
    'meeting-load': {
      demandPct: Math.min(90, 35 + meetings * 20),
      summary: `${meetings} executive meeting(s) — ${meetings >= 3 ? 'meeting-heavy day' : 'balanced rhythm'}`,
    },
    'creative-workload': {
      demandPct: marketing ? Math.min(85, 40 + (100 - marketing.scorePct) * 0.4) : 50,
      summary: marketing
        ? `Creative pipeline ${marketing.scorePct}% capacity · campaign activity active`
        : 'Creative workload steady',
    },
    'strategic-workload': {
      demandPct: founder
        ? Math.min(92, 100 - founder.scorePct + pendingApprovals * 5)
        : awareness
        ? 55 + (awareness.awarenessScore > 75 ? 10 : 0)
        : 58,
      summary: awareness
        ? `Strategic focus: ${awareness.intelligentContext.founderFocus.slice(0, 70)}`
        : 'Strategic workload aligned with executive priorities',
    },
  };

  return COGNITIVE_FACTORS.map((factor) => {
    const data = factorData[factor];
    return {
      factor,
      label: COGNITIVE_FACTOR_LABELS[factor],
      demandPct: Math.round(data.demandPct),
      status: demandStatus(data.demandPct),
      summary: data.summary,
    };
  });
}

export function computeCognitiveDemand(factors: CognitiveFactorSnapshot[]): number {
  if (factors.length === 0) return 0;
  return Math.round(factors.reduce((s, f) => s + f.demandPct, 0) / factors.length);
}

export function resolveLoadState(demandPct: number): import('./types').LoadState {
  if (demandPct >= 78) return 'critical';
  if (demandPct >= 62) return 'elevated';
  if (demandPct >= 45) return 'moderate';
  return 'light';
}
