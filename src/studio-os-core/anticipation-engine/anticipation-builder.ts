import { getOrganizationAmbientAwarenessProfile } from '../ambient-awareness/store';
import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { ANTICIPATION_CATEGORY_LABELS } from './constants';
import { buildOrganizationalPatterns } from './pattern-engine';
import { buildProactivePreparations, summarizePreparations } from './preparation-engine';
import type { AnticipationItem, OrganizationAnticipationProfile } from './types';

function daysUntilMonthEnd(): number {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(1, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function daysUntilQuarterEnd(): number {
  const now = new Date();
  const quarterMonth = Math.floor(now.getMonth() / 3) * 3 + 2;
  const end = new Date(now.getFullYear(), quarterMonth + 1, 0);
  return Math.max(1, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function buildAnticipationItems(organizationId: string, companyName: string): AnticipationItem[] {
  const pulse = getOrganizationPulseProfile(organizationId);
  const health = getOrganizationHealthIndexProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  const confidence = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const awareness = getOrganizationAmbientAwarenessProfile(organizationId);

  const items: AnticipationItem[] = [];

  if (blueprint && blueprint.overallProgressPct >= 55) {
    items.push({
      id: `ant-${organizationId}-launch`,
      category: 'upcoming-launches',
      label: ANTICIPATION_CATEGORY_LABELS['upcoming-launches'],
      summary: `Launch week approaching for ${companyName} — discovery ${blueprint.overallProgressPct}% complete.`,
      urgency: blueprint.overallProgressPct >= 80 ? 'high' : 'medium',
      predictedWindow: 'Next 2–3 weeks',
      confidencePct: blueprint.overallProgressPct,
    });
  }

  items.push({
    id: `ant-${organizationId}-deadline`,
    category: 'deadlines',
    label: ANTICIPATION_CATEGORY_LABELS.deadlines,
    summary: `${daysUntilMonthEnd()} days until month-end reporting and executive calendar commitments.`,
    urgency: daysUntilMonthEnd() <= 7 ? 'high' : 'medium',
    predictedWindow: `${daysUntilMonthEnd()} days`,
    confidencePct: 88,
  });

  const month = new Date().getMonth();
  if (month === 0 || month === 1 || month === 10 || month === 11) {
    items.push({
      id: `ant-${organizationId}-busy-season`,
      category: 'busy-seasons',
      label: ANTICIPATION_CATEGORY_LABELS['busy-seasons'],
      summary: 'Busy season detected — capacity planning recommended across departments.',
      urgency: 'medium',
      predictedWindow: 'Current season',
      confidencePct: 79,
    });
  }

  items.push({
    id: `ant-${organizationId}-annual`,
    category: 'annual-events',
    label: ANTICIPATION_CATEGORY_LABELS['annual-events'],
    summary: `Quarterly review in ${daysUntilQuarterEnd()} days — executive synthesis cycle.`,
    urgency: daysUntilQuarterEnd() <= 14 ? 'high' : 'medium',
    predictedWindow: `${daysUntilQuarterEnd()} days`,
    confidencePct: 84,
  });

  const marketing = pulse?.indicatorScores.find((i) => /marketing/i.test(i.label));
  if (marketing) {
    items.push({
      id: `ant-${organizationId}-marketing`,
      category: 'marketing-opportunities',
      label: ANTICIPATION_CATEGORY_LABELS['marketing-opportunities'],
      summary: `Marketing pulse ${marketing.scorePct}% · ${marketing.trend} trend — promotional window identified.`,
      urgency: marketing.trend === 'accelerating' ? 'high' : 'medium',
      predictedWindow: 'This week',
      confidencePct: marketing.scorePct,
    });
  }

  if (pulse && pulse.overallPulseScore < 72) {
    items.push({
      id: `ant-${organizationId}-hiring`,
      category: 'hiring-needs',
      label: ANTICIPATION_CATEGORY_LABELS['hiring-needs'],
      summary: 'Workload strain signals suggest capacity expansion — hiring evaluation recommended.',
      urgency: 'medium',
      predictedWindow: 'Next 30 days',
      confidencePct: 70,
    });
  }

  if (confidence && confidence.brainsNeedingTeaching > 0) {
    items.push({
      id: `ant-${organizationId}-knowledge`,
      category: 'knowledge-gaps',
      label: ANTICIPATION_CATEGORY_LABELS['knowledge-gaps'],
      summary: `${confidence.brainsNeedingTeaching} Profession Brain(s) need teaching — knowledge gaps anticipated.`,
      urgency: 'medium',
      predictedWindow: 'Ongoing',
      confidencePct: confidence.overallConfidenceScore,
    });
  }

  if (confidence && confidence.learningRecommendations.length > 0) {
    items.push({
      id: `ant-${organizationId}-training`,
      category: 'training-opportunities',
      label: ANTICIPATION_CATEGORY_LABELS['training-opportunities'],
      summary: confidence.learningRecommendations[0].recommendation.slice(0, 90),
      urgency: 'low',
      predictedWindow: 'Next 2 weeks',
      confidencePct: 72,
    });
  }

  const cx = pulse?.indicatorScores.find((i) => /customer/i.test(i.label));
  if (cx && (cx.trend === 'declining' || cx.scorePct < 65)) {
    items.push({
      id: `ant-${organizationId}-customer`,
      category: 'customer-follow-ups',
      label: ANTICIPATION_CATEGORY_LABELS['customer-follow-ups'],
      summary: `Customer experience pulse ${cx.scorePct}% — proactive follow-ups recommended.`,
      urgency: 'high',
      predictedWindow: 'This week',
      confidencePct: cx.scorePct,
    });
  }

  const revenue = pulse?.indicatorScores.find((i) => /revenue/i.test(i.label));
  if (revenue) {
    items.push({
      id: `ant-${organizationId}-revenue`,
      category: 'revenue-opportunities',
      label: ANTICIPATION_CATEGORY_LABELS['revenue-opportunities'],
      summary: `Revenue momentum ${revenue.scorePct}% · ${revenue.trend} — opportunity window open.`,
      urgency: revenue.trend === 'accelerating' ? 'high' : 'medium',
      predictedWindow: 'Next 14 days',
      confidencePct: revenue.scorePct,
    });
  }

  if (health?.weakAreas[0]) {
    items.push({
      id: `ant-${organizationId}-bottleneck`,
      category: 'operational-bottlenecks',
      label: ANTICIPATION_CATEGORY_LABELS['operational-bottlenecks'],
      summary: `Operational bottleneck: ${health.weakAreas[0].label} — prepare mitigation before strain.`,
      urgency: 'high',
      predictedWindow: 'Immediate',
      confidencePct: 75,
    });
  }

  const founder = pulse?.indicatorScores.find((i) => /founder/i.test(i.label));
  items.push({
    id: `ant-${organizationId}-founder`,
    category: 'founder-workload',
    label: ANTICIPATION_CATEGORY_LABELS['founder-workload'],
    summary: founder
      ? `Founder workload pulse ${founder.scorePct}% · ${founder.trend} — delegate prepared materials.`
      : awareness?.intelligentContext.founderFocus
      ? `Founder focus: ${awareness.intelligentContext.founderFocus}`
      : 'Founder workload monitoring active — prepared work reduces operational noise.',
    urgency: founder && founder.scorePct < 60 ? 'critical' : 'medium',
    predictedWindow: 'Today',
    confidencePct: founder?.scorePct ?? 68,
  });

  if (council?.pendingDecisions) {
    items.push({
      id: `ant-${organizationId}-council`,
      category: 'deadlines',
      label: 'Executive Council decisions pending',
      summary: `${council.pendingDecisions} council decision(s) awaiting founder approval.`,
      urgency: 'high',
      predictedWindow: 'This week',
      confidencePct: 80,
    });
  }

  return items.slice(0, 12);
}

export function computeAnticipationScore(items: AnticipationItem[], preparationsCount: number): number {
  if (items.length === 0) return 0;
  const avgConfidence = items.reduce((s, i) => s + i.confidencePct, 0) / items.length;
  const prepBoost = Math.min(15, preparationsCount * 2);
  return Math.min(100, Math.round(avgConfidence * 0.75 + prepBoost));
}

export function buildDockHeadline(preparations: ReturnType<typeof buildProactivePreparations>): string {
  const top = preparations[0];
  if (!top) return "Anticipation Engine monitoring — I'll prepare before you ask.";
  if (top.type === 'meetings') return "I've already prepared tomorrow's meeting agenda.";
  if (top.type === 'launch-assets') return 'I noticed launch week is approaching.';
  if (top.type === 'content-queue') return "I've generated three promotional concepts.";
  if (top.type === 'presentations') return 'Your quarterly review is next week.';
  return "I've prepared everything — awaiting your approval.";
}

export function buildOrganizationAnticipationProfile(organizationId: string): OrganizationAnticipationProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const anticipationItems = buildAnticipationItems(organizationId, companyName);
  const organizationalPatterns = buildOrganizationalPatterns(organizationId);
  const proactivePreparations = buildProactivePreparations(organizationId, anticipationItems);

  return {
    organizationId,
    companyName,
    industryId: brain?.industryId ?? organizationId,
    updatedAt: new Date().toISOString(),
    anticipationScore: computeAnticipationScore(anticipationItems, proactivePreparations.length),
    anticipationsIdentified: anticipationItems.length,
    preparationsReady: proactivePreparations.length,
    anticipationItems,
    proactivePreparations,
    organizationalPatterns,
    dockHeadline: buildDockHeadline(proactivePreparations),
    syncedSources: [
      'ambient-awareness',
      'organization-pulse',
      'company-health-index',
      'executive-council',
      'business-discovery-blueprint',
      'profession-brain',
      'knowledge-confidence',
      'memory-engine',
      'command-dock',
    ],
  };
}

export function summarizeAnticipationProfile(profile: OrganizationAnticipationProfile): string {
  return [
    profile.dockHeadline,
    `${profile.anticipationsIdentified} need(s) anticipated · ${profile.preparationsReady} preparation(s) ready.`,
    summarizePreparations(profile.proactivePreparations),
  ].join(' ');
}
