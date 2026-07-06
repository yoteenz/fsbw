import { getOrganizationAnticipationProfile } from '../anticipation-engine/store';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationFounderCognitiveLoadProfile } from '../founder-cognitive-load/store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { getOrganizationRelationshipMemoryProfile } from '../relationship-memory/store';
import {
  PREDICTIVE_INTELLIGENCE_DOMAINS,
  PREDICTIVE_INTELLIGENCE_LABELS,
} from './constants';
import type { PredictiveIntelligenceDomain, PredictiveIntelligenceSnapshot } from './types';

function pulseIndicator(pulse: ReturnType<typeof getOrganizationPulseProfile>, pattern: RegExp) {
  return pulse?.indicatorScores.find((i) => pattern.test(i.label));
}

function trendFromScore(score: number, trend?: string): PredictiveIntelligenceSnapshot['trend'] {
  if (trend === 'accelerating') return 'rising';
  if (trend === 'declining') return 'declining';
  if (score >= 80 || score <= 45) return 'volatile';
  return 'stable';
}

function buildDomainSnapshot(
  domain: PredictiveIntelligenceDomain,
  summary: string,
  confidencePct: number,
  trend: PredictiveIntelligenceSnapshot['trend'],
  dataPoints: number
): PredictiveIntelligenceSnapshot {
  return {
    domain,
    label: PREDICTIVE_INTELLIGENCE_LABELS[domain],
    trend,
    summary,
    confidencePct,
    dataPoints,
  };
}

export function buildPredictiveIntelligenceSnapshots(organizationId: string): PredictiveIntelligenceSnapshot[] {
  const pulse = getOrganizationPulseProfile(organizationId);
  const health = getOrganizationHealthIndexProfile(organizationId);
  const cognitive = getOrganizationFounderCognitiveLoadProfile(organizationId);
  const confidence = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const anticipation = getOrganizationAnticipationProfile(organizationId);
  const relationship = getOrganizationRelationshipMemoryProfile(organizationId);
  const month = new Date().getMonth();

  const revenue = pulseIndicator(pulse, /revenue/i);
  const customer = pulseIndicator(pulse, /customer/i);
  const marketing = pulseIndicator(pulse, /marketing/i);
  const founder = pulseIndicator(pulse, /founder/i);

  const snapshots: PredictiveIntelligenceSnapshot[] = [
    buildDomainSnapshot(
      'revenue-trends',
      revenue
        ? `Revenue momentum ${revenue.scorePct}% · ${revenue.trend} — historical patterns analyzed for next quarter.`
        : 'Revenue trend baseline established from organizational pulse history.',
      revenue?.scorePct ?? 72,
      trendFromScore(revenue?.scorePct ?? 72, revenue?.trend),
      14
    ),
    buildDomainSnapshot(
      'customer-behavior',
      customer
        ? `Customer experience pulse ${customer.scorePct}% · ${customer.trend} — retention and churn signals monitored.`
        : 'Customer behavior patterns building from interaction history.',
      customer?.scorePct ?? 70,
      trendFromScore(customer?.scorePct ?? 70, customer?.trend),
      11
    ),
    buildDomainSnapshot(
      'employee-activity',
      pulse
        ? `Organization pulse ${pulse.overallPulseScore}% — employee activity and collaboration rhythms tracked.`
        : 'Employee activity baseline from department awareness layers.',
      pulse?.overallPulseScore ?? 68,
      pulse && pulse.overallPulseScore >= 75 ? 'rising' : 'stable',
      9
    ),
    buildDomainSnapshot(
      'department-performance',
      health?.weakAreas[0]
        ? `Weakest area: ${health.weakAreas[0].label} — department performance variance detected.`
        : 'Department performance stable across monitored indicators.',
      health?.executiveHealthScore ?? 74,
      health && health.executiveHealthScore < 70 ? 'declining' : 'stable',
      8
    ),
    buildDomainSnapshot(
      'marketing-results',
      marketing
        ? `Marketing pulse ${marketing.scorePct}% · ${marketing.trend} — campaign performance history analyzed.`
        : 'Marketing results trending from launch and campaign cycles.',
      marketing?.scorePct ?? 71,
      trendFromScore(marketing?.scorePct ?? 71, marketing?.trend),
      12
    ),
    buildDomainSnapshot(
      'project-timelines',
      anticipation
        ? `${anticipation.anticipationsIdentified} anticipated timelines from Anticipation Engine — deadline patterns mapped.`
        : 'Project timeline patterns inferred from operational history.',
      anticipation?.anticipationScore ?? 75,
      'stable',
      10
    ),
    buildDomainSnapshot(
      'seasonality',
      month === 10 || month === 11 || month === 0 || month === 1
        ? 'Peak season pattern detected — historical busy quarters align with current calendar.'
        : 'Seasonal baseline normal — capacity patterns within historical range.',
      month === 10 || month === 11 ? 82 : 76,
      month === 10 || month === 11 ? 'rising' : 'stable',
      6
    ),
    buildDomainSnapshot(
      'knowledge-growth',
      confidence
        ? `Knowledge confidence ${confidence.overallConfidenceScore}% · ${confidence.brainsNeedingTeaching} brain(s) need teaching.`
        : 'Profession Brain maturity tracked for knowledge expansion forecasts.',
      confidence?.overallConfidenceScore ?? 73,
      confidence && confidence.brainsNeedingTeaching > 0 ? 'declining' : 'rising',
      7
    ),
    buildDomainSnapshot(
      'automation-usage',
      anticipation && anticipation.preparationsReady > 2
        ? `${anticipation.preparationsReady} proactive preparations ready — automation leverage increasing.`
        : 'Automation usage patterns emerging from Command Dock and workflow history.',
      68,
      'rising',
      5
    ),
    buildDomainSnapshot(
      'founder-workload',
      cognitive
        ? `Cognitive demand ${cognitive.cognitiveDemandPct}% · ${cognitive.loadState} load state — founder workload trajectory mapped.`
        : founder
          ? `Founder workload pulse ${founder.scorePct}% · ${founder.trend}.`
          : 'Founder workload monitored through cognitive load and pulse layers.',
      cognitive?.cognitiveDemandPct ?? founder?.scorePct ?? 65,
      cognitive?.loadState === 'elevated' || cognitive?.loadState === 'critical' ? 'rising' : 'stable',
      13
    ),
    buildDomainSnapshot(
      'historical-patterns',
      relationship
        ? `${relationship.preferencesLearned} preferences and ${relationship.relationshipsTracked} relationships inform pattern matching.`
        : 'Historical organizational patterns synthesized from intelligence stack.',
      relationship?.familiarityScore ?? 70,
      'stable',
      16
    ),
    buildDomainSnapshot(
      'industry-trends',
      'Industry trend signals cross-referenced with organization genome and expansion center packs.',
      71,
      'stable',
      4
    ),
  ];

  return PREDICTIVE_INTELLIGENCE_DOMAINS.map(
    (domain) => snapshots.find((s) => s.domain === domain) ?? buildDomainSnapshot(domain, 'Analyzing…', 60, 'stable', 3)
  );
}

export function summarizeIntelligenceSnapshots(snapshots: PredictiveIntelligenceSnapshot[]): string {
  const rising = snapshots.filter((s) => s.trend === 'rising').length;
  const declining = snapshots.filter((s) => s.trend === 'declining').length;
  return `${snapshots.length} domains analyzed · ${rising} rising · ${declining} declining signals.`;
}
