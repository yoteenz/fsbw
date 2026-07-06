import { getOrganizationDecisionAuditProfile } from '../decision-audit/store';
import { getOrganizationExecutiveTrustDashboardProfile } from '../executive-trust-dashboard/store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationPredictiveQaProfile } from '../predictive-qa/store';
import { getOrganizationQaSimulationEngineProfile } from '../qa-simulation-engine/store';
import {
  CONFIDENCE_LEVEL_LABELS,
  LOW_CONFIDENCE_MESSAGES,
  RECOMMENDATION_CATEGORY_LABELS,
} from './constants';
import type { ConfidenceLevel, ConfidenceRecommendation, RecommendationCategory } from './types';

function scoreToLevel(score: number): ConfidenceLevel {
  if (score >= 90) return 'very-high';
  if (score >= 75) return 'high';
  if (score >= 55) return 'moderate';
  if (score >= 35) return 'low';
  return 'insufficient-evidence';
}

function buildConversationalExplanation(
  recommendation: string,
  score: number,
  evidence: string[]
): string {
  const level = CONFIDENCE_LEVEL_LABELS[scoreToLevel(score)];
  return `I recommend ${recommendation.toLowerCase().replace(/\.$/, '')}. Confidence: ${score}% (${level}). Based on: ${evidence.slice(0, 4).map((e) => `• ${e}`).join(' ')}`;
}

type RecSeed = Omit<
  ConfidenceRecommendation,
  | 'id'
  | 'categoryLabel'
  | 'confidenceLevel'
  | 'confidenceLevelLabel'
  | 'conversationalExplanation'
  | 'lowConfidenceDisclaimer'
  | 'recommendedAt'
>;

const RECOMMENDATION_SEEDS: RecSeed[] = [
  {
    category: 'publishing-schedule',
    recommendation: 'Publish the quarterly tax tips article on Tuesday at 10am EST.',
    confidenceScore: 92,
    supportingEvidence: [
      'Historical engagement: Tuesday mornings +34% open rate',
      'Audience activity peaks 9–11am EST',
      'Similar organizations see best results mid-week mornings',
      'Previous campaign performance: 91% success on comparable articles',
    ],
    reasoningSummary:
      'Engagement model, audience activity patterns, and historical campaign data align on Tuesday 10am as optimal publish window.',
    knowledgeSources: ['Engagement Analytics', 'Publishing Calendar', 'Knowledge Graph: Tax Filing'],
    recentValidation: ['QA validation passed · content accuracy verified', 'Knowledge Confidence: topic coverage at 88%'],
    simulationResults: ['Customer Simulation: 6/7 personas completed article flow', 'Accessibility audit passed'],
    relatedHistoricalOutcomes: ['Q4 tax article: 2,400 views · 18% conversion to consultation', 'Similar article last year: 34% above average engagement'],
    riskLevel: 'low',
    whatWeKnow: ['Tuesday engagement pattern is consistent over 6 months', 'Article content is fully validated', 'No competing publications scheduled'],
    whatWeDontKnow: ['Breaking news may overshadow publication', 'Expert availability for follow-up Q&A unconfirmed'],
  },
  {
    category: 'workflow-approval',
    recommendation: 'Approve customer onboarding workflow v3 for production.',
    confidenceScore: 88,
    supportingEvidence: [
      'QA Simulation: 91% success rate across 7 personas',
      'Production gate cleared · 6/7 simulations passed',
      'Executive Trust Dashboard workflow trust at 88%',
    ],
    reasoningSummary: 'Simulation results exceed threshold · trust metrics stable · onboarding volume increasing.',
    knowledgeSources: ['Workflow Template v3', 'QA Simulation Engine', 'Executive Trust Dashboard'],
    recentValidation: ['QA Inspector: no critical findings on onboarding path', 'Accessibility validation passed'],
    simulationResults: ['Mobile checkout: 89% success · Desktop: 94% success', 'Drop-off risk: 14% (within threshold)'],
    relatedHistoricalOutcomes: ['v2 onboarding: 23% longer completion time', 'v1 to v2 migration reduced support tickets 31%'],
    riskLevel: 'medium',
    whatWeKnow: ['Simulation results strong', 'Trust scores stable', 'Workflow tested across personas'],
    whatWeDontKnow: ['Peak volume stress test not yet run at 2× current load'],
  },
  {
    category: 'pricing-change',
    recommendation: 'Increase premium consultation tier pricing by 8%.',
    confidenceScore: 67,
    supportingEvidence: [
      'Expert waitlist at 34% · demand exceeds supply',
      'Competitor pricing 12% below market average',
    ],
    reasoningSummary: 'Supply/demand imbalance supports pricing adjustment · competitor analysis favorable · limited price elasticity data.',
    knowledgeSources: ['Marketplace Analytics', 'Competitor Pricing Report'],
    recentValidation: ['Customer satisfaction on premium tier: 94%'],
    simulationResults: ['Pricing simulation: moderate churn risk at +8%'],
    relatedHistoricalOutcomes: ['Last price increase (+5%): 3% churn · revenue +11%'],
    riskLevel: 'medium',
    whatWeKnow: ['Demand exceeds expert supply', 'Customer satisfaction high', 'Competitors priced higher'],
    whatWeDontKnow: ['Long-term price elasticity for this customer segment', 'Expert compensation expectations at new rate'],
  },
  {
    category: 'expert-hiring',
    recommendation: 'Hire tax specialist expert to close marketplace capacity gap.',
    confidenceScore: 84,
    supportingEvidence: [
      'Predictive QA: staffing will not support projected demand next month',
      'Tax consultation waitlist at 41%',
      'Candidate credentials verified',
    ],
    reasoningSummary: 'Predictive staffing forecast · marketplace SLA at risk · qualified candidate available.',
    knowledgeSources: ['Expert Marketplace SLA Report', 'Predictive QA Staffing Forecast', 'Candidate Profile'],
    recentValidation: ['Professional Trust Framework credential check passed'],
    simulationResults: ['Capacity simulation: hiring closes waitlist in 18 days'],
    relatedHistoricalOutcomes: ['Previous expert hire: waitlist reduced 38% in 3 weeks'],
    riskLevel: 'low',
    whatWeKnow: ['Demand forecast reliable', 'Candidate qualified', 'Onboarding process tested'],
    whatWeDontKnow: ['Candidate acceptance timeline', 'Ramp-up productivity curve'],
  },
  {
    category: 'automation-trigger',
    recommendation: 'Enable welcome email automation for new customer accounts.',
    confidenceScore: 96,
    supportingEvidence: [
      'Automation health check passed · 99% delivery rate last 30 days',
      'Template validated · consent captured on all recent signups',
      'Shadow Mode confidence at 94% for this automation',
    ],
    reasoningSummary: 'Low-risk automation · all pre-conditions met · extensive historical success.',
    knowledgeSources: ['Automation Registry #12', 'Welcome Email Template v2', 'Shadow Mode Confidence Log'],
    recentValidation: ['QA validation: template links verified', 'Deliverability audit passed'],
    simulationResults: ['End-to-end test: 100% success on last 50 accounts'],
    relatedHistoricalOutcomes: ['Welcome sequence: 47% reduction in time-to-first-action'],
    riskLevel: 'low',
    whatWeKnow: ['Automation proven reliable', 'Template current', 'Consent policy compliant'],
    whatWeDontKnow: ['Deliverability if domain reputation changes'],
  },
  {
    category: 'knowledge-publication',
    recommendation: 'Publish permit approval process guide after expert review.',
    confidenceScore: 58,
    supportingEvidence: [
      'Auto-generated draft from workflow metadata',
      'Knowledge Confidence for permit topic at 72%',
    ],
    reasoningSummary: 'Content gap identified · draft available · expert review needed before customer-facing publish.',
    knowledgeSources: ['Permit Approval Workflow', 'Knowledge Graph Gap Report'],
    recentValidation: ['QA Inspector flagged documentation gap'],
    simulationResults: ['Not yet simulated — awaiting content finalization'],
    relatedHistoricalOutcomes: ['Similar auto-generated guides required 2 revision cycles before publish'],
    riskLevel: 'medium',
    whatWeKnow: ['Workflow metadata accurate', 'Gap confirmed by QA'],
    whatWeDontKnow: ['Expert review timeline', 'Customer-facing accuracy without human validation'],
  },
  {
    category: 'marketplace-listing',
    recommendation: 'Approve premium service listing after compliance review.',
    confidenceScore: 41,
    supportingEvidence: [
      'Listing partially complete · compliance attestation pending',
      'Seller history: 2 prior approved listings',
    ],
    reasoningSummary: 'Limited evidence on new service category · seller track record positive · compliance incomplete.',
    knowledgeSources: ['Listing Submission #2847', 'Seller History'],
    recentValidation: ['Compliance check: 2 of 5 required fields missing'],
    simulationResults: ['No simulation run — insufficient listing data'],
    relatedHistoricalOutcomes: ['Similar new-category listings: 60% required revision before approval'],
    riskLevel: 'high',
    whatWeKnow: ['Seller has approved history', 'Product images verified'],
    whatWeDontKnow: ['Compliance attestation status', 'Service delivery capacity', 'Category-specific policy requirements'],
  },
  {
    category: 'customer-outreach',
    recommendation: 'Send re-engagement campaign to dormant customers from last quarter.',
    confidenceScore: 72,
    supportingEvidence: [
      '847 customers inactive 90+ days · LTV historically high',
      'Previous re-engagement campaign: 12% return rate',
    ],
    reasoningSummary: 'Historical campaign data supports outreach · segment well-defined · timing appropriate.',
    knowledgeSources: ['Customer Activity Report', 'Campaign Performance History'],
    recentValidation: ['Email template reviewed · unsubscribe compliance verified'],
    simulationResults: ['A/B simulation: subject line B +8% open rate'],
    relatedHistoricalOutcomes: ['Q3 re-engagement: 12% return · $4,200 recovered revenue'],
    riskLevel: 'low',
    whatWeKnow: ['Segment defined', 'Template compliant', 'Historical return rate documented'],
    whatWeDontKnow: ['Current customer sentiment after recent service issues'],
  },
  {
    category: 'risk-escalation',
    recommendation: 'Escalate permission conflict to Security team immediately.',
    confidenceScore: 93,
    supportingEvidence: [
      'QA Inspector critical finding on Editor role',
      'Predictive QA: unauthorized access incident likely within 7 days',
      'Self-Healing Recovery Plan prepared',
    ],
    reasoningSummary: 'Multiple QA signals converge · critical severity · restricted domain requires human action.',
    knowledgeSources: ['Permission Engine Audit', 'Predictive QA Report', 'Self-Healing Recovery Plan'],
    recentValidation: ['Decision Audit recorded escalation · awaiting executive approval'],
    simulationResults: ['Permission simulation: delete capability accessible from 3 workflows'],
    relatedHistoricalOutcomes: ['Similar permission drift: resolved in 15 minutes when acted within 24 hours'],
    riskLevel: 'critical',
    whatWeKnow: ['Conflict confirmed by multiple sources', 'Recovery plan ready', 'Impact scope mapped'],
    whatWeDontKnow: ['Whether exploit already attempted'],
  },
  {
    category: 'resource-allocation',
    recommendation: 'Allocate engineering sprint to workflow migration before peak season.',
    confidenceScore: 48,
    supportingEvidence: [
      '6 workflows on deprecated template v2',
      'Predictive QA: legacy paths may fail under 2× load',
    ],
    reasoningSummary: 'Technical debt accumulating · predictive signals warn of failure · limited capacity planning data.',
    knowledgeSources: ['Workflow Registry', 'Predictive QA Technical Debt Report'],
    recentValidation: ['QA Inspector: 4 deferred migrations past SLA'],
    simulationResults: ['Load test not yet scheduled'],
    relatedHistoricalOutcomes: ['Previous migration sprint: 89% error reduction on migrated paths'],
    riskLevel: 'high',
    whatWeKnow: ['Deprecated templates identified', 'Failure risk under scale'],
    whatWeDontKnow: ['Exact peak season timing', 'Engineering capacity availability', 'Migration effort estimates'],
  },
];

export function buildConfidenceRecommendations(organizationId: string, now: string): ConfidenceRecommendation[] {
  const knowledge = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const trust = getOrganizationExecutiveTrustDashboardProfile(organizationId);
  const simulation = getOrganizationQaSimulationEngineProfile(organizationId);
  const predictive = getOrganizationPredictiveQaProfile(organizationId);
  const audit = getOrganizationDecisionAuditProfile(organizationId);

  return RECOMMENDATION_SEEDS.map((seed, i) => {
    let score = seed.confidenceScore;
    if (knowledge && knowledge.overallConfidenceScore < 75 && seed.category === 'knowledge-publication') {
      score = Math.max(35, score - 8);
    }
    if (trust && trust.overallTrustScore >= 85 && seed.riskLevel === 'low') {
      score = Math.min(99, score + 2);
    }
    if (simulation && simulation.productionGateStatus === 'blocked' && seed.category === 'workflow-approval') {
      score = Math.max(40, score - 12);
    }
    if (predictive && seed.category === 'risk-escalation') score = Math.min(99, score + 2);
    if (audit && seed.category === 'publishing-schedule') score = Math.min(99, score + 1);

    const level = scoreToLevel(score);
    const disclaimer =
      level === 'low' || level === 'insufficient-evidence'
        ? LOW_CONFIDENCE_MESSAGES[i % LOW_CONFIDENCE_MESSAGES.length]
        : null;

    return {
      ...seed,
      id: `rec-${seed.category}-${i}`,
      categoryLabel: RECOMMENDATION_CATEGORY_LABELS[seed.category],
      confidenceScore: score,
      confidenceLevel: level,
      confidenceLevelLabel: CONFIDENCE_LEVEL_LABELS[level],
      conversationalExplanation: buildConversationalExplanation(seed.recommendation, score, seed.supportingEvidence),
      lowConfidenceDisclaimer: disclaimer,
      recommendedAt: now,
    };
  }).sort((a, b) => b.confidenceScore - a.confidenceScore);
}

export function computeOverallConfidence(recommendations: ConfidenceRecommendation[]): number {
  if (recommendations.length === 0) return 0;
  return Math.round(recommendations.reduce((s, r) => s + r.confidenceScore, 0) / recommendations.length);
}

export function countLowConfidence(recommendations: ConfidenceRecommendation[]): number {
  return recommendations.filter(
    (r) => r.confidenceLevel === 'low' || r.confidenceLevel === 'insufficient-evidence'
  ).length;
}

export function getRecommendationById(
  recommendations: ConfidenceRecommendation[],
  id: string
): ConfidenceRecommendation | null {
  return recommendations.find((r) => r.id === id) ?? null;
}

export function getRecommendationsByCategory(
  recommendations: ConfidenceRecommendation[],
  category: RecommendationCategory
): ConfidenceRecommendation[] {
  return recommendations.filter((r) => r.category === category);
}
