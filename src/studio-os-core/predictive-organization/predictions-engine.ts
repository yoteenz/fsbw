import { getOrganizationAnticipationProfile } from '../anticipation-engine/store';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationFounderCognitiveLoadProfile } from '../founder-cognitive-load/store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { PREDICTION_CATEGORY_LABELS } from './constants';
import type { OrganizationPrediction, PredictiveIntelligenceSnapshot } from './types';

function pulseIndicator(pulse: ReturnType<typeof getOrganizationPulseProfile>, pattern: RegExp) {
  return pulse?.indicatorScores.find((i) => pattern.test(i.label));
}

export function buildOrganizationPredictions(
  organizationId: string,
  snapshots: PredictiveIntelligenceSnapshot[]
): OrganizationPrediction[] {
  const pulse = getOrganizationPulseProfile(organizationId);
  const health = getOrganizationHealthIndexProfile(organizationId);
  const cognitive = getOrganizationFounderCognitiveLoadProfile(organizationId);
  const confidence = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const anticipation = getOrganizationAnticipationProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const month = new Date().getMonth();

  const marketing = pulseIndicator(pulse, /marketing/i);
  const customer = pulseIndicator(pulse, /customer/i);
  const revenue = pulseIndicator(pulse, /revenue/i);

  const seasonality = snapshots.find((s) => s.domain === 'seasonality');
  const predictions: OrganizationPrediction[] = [];

  if (month === 10 || month === 11 || seasonality?.trend === 'rising') {
    predictions.push({
      id: `pred-${organizationId}-busy-season`,
      category: 'busy-season',
      label: PREDICTION_CATEGORY_LABELS['busy-season'],
      prediction: 'Busy season approaching — capacity strain likely within 30 days.',
      reasoning: 'Historical seasonality patterns align with current calendar and rising demand signals.',
      recommendedAction: 'Begin cross-department capacity planning and defer non-critical initiatives.',
      confidencePct: seasonality?.confidencePct ?? 79,
      predictedWindow: '~30 days',
      severity: 'medium',
    });
  }

  if (pulse && pulse.overallPulseScore < 72) {
    predictions.push({
      id: `pred-${organizationId}-hiring`,
      category: 'hiring',
      label: PREDICTION_CATEGORY_LABELS.hiring,
      prediction: 'Hiring likely needed within 60 days — workload exceeding sustainable capacity.',
      reasoning: `Organization pulse ${pulse.overallPulseScore}% with department strain indicators.`,
      recommendedAction: 'Evaluate Operations and Customer Success headcount before peak season.',
      confidencePct: 74,
      predictedWindow: '60 days',
      severity: 'medium',
    });
  }

  if (marketing && (marketing.trend === 'declining' || marketing.scorePct < 62)) {
    predictions.push({
      id: `pred-${organizationId}-marketing`,
      category: 'marketing',
      label: PREDICTION_CATEGORY_LABELS.marketing,
      prediction: 'Marketing performance expected to slow — campaign fatigue pattern detected.',
      reasoning: `Marketing pulse ${marketing.scorePct}% · ${marketing.trend} trend over recent cycles.`,
      recommendedAction: 'Refresh creative assets and review channel mix before next launch window.',
      confidencePct: marketing.scorePct,
      predictedWindow: 'Next 2–4 weeks',
      severity: 'medium',
    });
  }

  if (customer && (customer.trend === 'declining' || customer.scorePct < 65)) {
    predictions.push({
      id: `pred-${organizationId}-churn`,
      category: 'customer-churn',
      label: PREDICTION_CATEGORY_LABELS['customer-churn'],
      prediction: 'Customer churn risk increasing — retention intervention recommended.',
      reasoning: `Customer behavior pulse ${customer.scorePct}% · ${customer.trend}.`,
      recommendedAction: 'Launch proactive outreach to at-risk accounts before renewal windows.',
      confidencePct: Math.max(65, 100 - customer.scorePct),
      predictedWindow: '30 days',
      severity: 'high',
    });
  }

  if (health?.weakAreas.some((w) => /inventory|supply|stock/i.test(w.label))) {
    predictions.push({
      id: `pred-${organizationId}-inventory`,
      category: 'inventory',
      label: PREDICTION_CATEGORY_LABELS.inventory,
      prediction: 'Inventory shortage predicted — supply chain bottleneck emerging.',
      reasoning: `Health index weak area: ${health.weakAreas.find((w) => /inventory|supply|stock/i.test(w.label))?.label}.`,
      recommendedAction: 'Reorder critical inventory and notify Operations before stockout.',
      confidencePct: 78,
      predictedWindow: '2–3 weeks',
      severity: 'high',
    });
  }

  if (confidence && confidence.brainsNeedingTeaching > 0) {
    predictions.push({
      id: `pred-${organizationId}-knowledge`,
      category: 'knowledge-gaps',
      label: PREDICTION_CATEGORY_LABELS['knowledge-gaps'],
      prediction: 'Knowledge gaps emerging — institutional memory may not cover upcoming decisions.',
      reasoning: `${confidence.brainsNeedingTeaching} Profession Brain(s) below teaching threshold.`,
      recommendedAction: 'Schedule knowledge capture sessions and update Profession Brain entries.',
      confidencePct: confidence.overallConfidenceScore,
      predictedWindow: 'Ongoing',
      severity: 'medium',
    });
  }

  const opsStrained = health?.weakAreas.some((w) => /operations|capacity|fulfillment/i.test(w.label));
  if (opsStrained || (pulse && pulse.overallPulseScore < 68)) {
    predictions.push({
      id: `pred-${organizationId}-capacity`,
      category: 'capacity',
      label: PREDICTION_CATEGORY_LABELS.capacity,
      prediction: 'Department capacity reaching limits — Operations likely strained before Marketing.',
      reasoning: 'Historical patterns show Operations absorbs peak load before creative departments.',
      recommendedAction: 'I predict Operations will require additional support before Marketing does — prioritize ops staffing.',
      confidencePct: 76,
      predictedWindow: '45 days',
      severity: 'high',
    });
  }

  if (cognitive && (cognitive.loadState === 'elevated' || cognitive.loadState === 'critical')) {
    predictions.push({
      id: `pred-${organizationId}-burnout`,
      category: 'founder-burnout',
      label: PREDICTION_CATEGORY_LABELS['founder-burnout'],
      prediction: 'Founder burnout probability increasing — cognitive demand unsustainable.',
      reasoning: `Cognitive demand ${cognitive.cognitiveDemandPct}% · ${cognitive.loadState} load state.`,
      recommendedAction: 'Activate Founder Cognitive Load protection — delegate prepared decisions.',
      confidencePct: cognitive.cognitiveDemandPct,
      predictedWindow: 'Immediate',
      severity: 'critical',
    });
  }

  if (revenue && revenue.trend === 'declining') {
    predictions.push({
      id: `pred-${organizationId}-cash-flow`,
      category: 'cash-flow',
      label: PREDICTION_CATEGORY_LABELS['cash-flow'],
      prediction: 'Cash flow tightening next quarter — revenue trend declining.',
      reasoning: `Revenue momentum ${revenue.scorePct}% · ${revenue.trend} over historical comparison.`,
      recommendedAction: 'Review discretionary spend and accelerate high-confidence revenue opportunities.',
      confidencePct: 73,
      predictedWindow: 'Next quarter',
      severity: 'high',
    });
  }

  if (blueprint && blueprint.overallProgressPct >= 70) {
    predictions.push({
      id: `pred-${organizationId}-launch`,
      category: 'launch',
      label: PREDICTION_CATEGORY_LABELS.launch,
      prediction: 'Launch window approaching — preparation should begin next week.',
      reasoning: `Blueprint ${blueprint.overallProgressPct}% complete · ${anticipation?.preparationsReady ?? 0} preparations ready.`,
      recommendedAction: 'Based on historical patterns, I recommend beginning launch preparations next week.',
      confidencePct: blueprint.overallProgressPct,
      predictedWindow: '7 days',
      severity: 'medium',
    });
  }

  if (anticipation && anticipation.preparationsReady >= 2) {
    predictions.push({
      id: `pred-${organizationId}-automation`,
      category: 'automation',
      label: PREDICTION_CATEGORY_LABELS.automation,
      prediction: 'Automation readiness high — recurring workflows ready for digital staff delegation.',
      reasoning: `${anticipation.preparationsReady} proactive preparations indicate repeatable patterns.`,
      recommendedAction: 'Expand Digital Workforce assignments for batched approvals and reporting.',
      confidencePct: 70,
      predictedWindow: '30 days',
      severity: 'low',
    });
  }

  if (health && health.executiveHealthScore < 68) {
    predictions.push({
      id: `pred-${organizationId}-risk`,
      category: 'risk',
      label: PREDICTION_CATEGORY_LABELS.risk,
      prediction: 'Operational risk elevated — multiple weak health indicators converging.',
      reasoning: `Company health ${health.executiveHealthScore}% · ${health.weakAreas.length} weak area(s).`,
      recommendedAction: 'Convene Executive Council review — mitigate before problems compound.',
      confidencePct: 80,
      predictedWindow: 'Immediate',
      severity: 'critical',
    });
  }

  return predictions.slice(0, 10);
}

export function summarizePredictions(predictions: OrganizationPrediction[]): string {
  if (!predictions.length) return 'Monitoring historical patterns — predictions will emerge as intelligence accumulates.';
  const top = predictions[0];
  return `${predictions.length} active prediction(s) · Top: ${top.prediction} (${top.confidencePct}% confidence).`;
}
