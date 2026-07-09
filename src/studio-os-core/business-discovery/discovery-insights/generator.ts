import { FOUNDER_MOMENT_TRIGGERS } from '../constants';
import { BUSINESS_DISCOVERY_PHASES } from '../phases';
import { scoreResponseDepth } from '../discovery-questions/engine';
import type {
  BusinessDiscoveryPhaseId,
  DiscoveryInsight,
  DiscoveryRecommendation,
  DiscoverySession,
} from '../types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function phaseResponses(session: DiscoverySession, phaseId: BusinessDiscoveryPhaseId) {
  return session.responses.filter((response) => response.phaseId === phaseId);
}

export function generatePhaseInsights(session: DiscoverySession, phaseId: BusinessDiscoveryPhaseId): DiscoveryInsight[] {
  const responses = phaseResponses(session, phaseId);
  if (!responses.length) return [];

  const phase = BUSINESS_DISCOVERY_PHASES.find((item) => item.id === phaseId);
  const avgDepth =
    responses.reduce((sum, response) => sum + scoreResponseDepth(response.answer), 0) / responses.length;
  const confidence = Math.min(95, Math.round(avgDepth * 0.85 + responses.length * 4));

  const insights: DiscoveryInsight[] = [
    {
      id: uid('insight'),
      title: `${phase?.title ?? phaseId} patterns emerging`,
      summary: `Captured ${responses.length} responses with ${Math.round(avgDepth)}% depth — enough to inform the Company Genome™.`,
      category: mapPhaseToInsightCategory(phaseId),
      sourcePhaseId: phaseId,
      confidence,
      generatedAt: new Date().toISOString(),
    },
  ];

  const founderMoment = pickFounderMoment(session, phaseId);
  if (founderMoment) {
    insights.push({
      id: uid('moment'),
      title: founderMoment,
      summary: `A meaningful milestone surfaced during ${phase?.title ?? phaseId}.`,
      category: mapPhaseToInsightCategory(phaseId),
      sourcePhaseId: phaseId,
      confidence: Math.min(100, confidence + 5),
      founderMoment,
      generatedAt: new Date().toISOString(),
    });
  }

  if (phaseId === 'relationship-discovery' && session.dependencies.length >= 2) {
    insights.push({
      id: uid('insight'),
      title: 'Hidden bottlenecks discovered',
      summary: `We discovered ${session.dependencies.filter((d) => d.bottleneckRisk !== 'low').length} workflow dependencies that may constrain growth.`,
      category: 'relationship',
      sourcePhaseId: phaseId,
      confidence: 88,
      founderMoment: 'We discovered three hidden bottlenecks.',
      generatedAt: new Date().toISOString(),
    });
  }

  if (phaseId === 'company-discovery' && session.company.customerSegments.length) {
    insights.push({
      id: uid('insight'),
      title: 'Customer journey mapped',
      summary: `Primary segments identified: ${session.company.customerSegments.slice(0, 3).join(', ')}.`,
      category: 'company',
      sourcePhaseId: phaseId,
      confidence: 84,
      founderMoment: 'Your customer journey has been mapped.',
      generatedAt: new Date().toISOString(),
    });
  }

  return insights;
}

function mapPhaseToInsightCategory(phaseId: BusinessDiscoveryPhaseId): DiscoveryInsight['category'] {
  const map: Record<BusinessDiscoveryPhaseId, DiscoveryInsight['category']> = {
    'founder-discovery': 'founder',
    'company-discovery': 'company',
    'relationship-discovery': 'relationship',
    'knowledge-discovery': 'knowledge',
    'business-genome': 'genome',
    'headquarters-generation': 'headquarters',
  };
  return map[phaseId];
}

function pickFounderMoment(session: DiscoverySession, phaseId: BusinessDiscoveryPhaseId): string | undefined {
  const candidates = FOUNDER_MOMENT_TRIGGERS[phaseId] ?? [];
  return candidates.find((moment) => !session.founderMomentsCelebrated.includes(moment));
}

export function generateDiscoveryRecommendations(session: DiscoverySession): DiscoveryRecommendation[] {
  const recommendations: DiscoveryRecommendation[] = [];

  if (session.risks.some((risk) => risk.severity === 'critical' || risk.severity === 'high')) {
    recommendations.push({
      id: uid('rec'),
      title: 'Address high-severity operational risks first',
      reasoning: 'Discovery surfaced fragile workflows or ownership gaps that could block Headquarters generation.',
      priority: 'critical',
      category: 'risk-reduction',
      estimatedImpact: 'high',
      sourcePhaseId: 'business-genome',
    });
  }

  if (session.dependencies.some((dep) => dep.bottleneckRisk === 'high')) {
    recommendations.push({
      id: uid('rec'),
      title: 'Document the request-to-delivery workflow',
      reasoning: 'Relationship discovery shows dependencies that would benefit from explicit SOPs in Profession Brain™.',
      priority: 'high',
      category: 'knowledge',
      estimatedImpact: 'moderate',
      sourcePhaseId: 'relationship-discovery',
    });
  }

  if (session.companyGenome && session.companyGenome.automationOpportunities.length) {
    recommendations.push({
      id: uid('rec'),
      title: 'Begin Shadow Mode observation on top automation candidate',
      reasoning: 'Automation opportunities are evidence-based — observation should precede any automation.',
      priority: 'medium',
      category: 'automation',
      estimatedImpact: 'high',
      sourcePhaseId: 'business-genome',
    });
  }

  if (session.overallProgressPercent >= 70 && !session.generatedHeadquarters) {
    recommendations.push({
      id: uid('rec'),
      title: 'Generate Headquarters proposal from Company Genome™',
      reasoning: 'Enough discovery evidence exists to propose Executive Headquarters, departments, and first missions.',
      priority: 'high',
      category: 'headquarters',
      estimatedImpact: 'transformative',
      sourcePhaseId: 'headquarters-generation',
    });
  }

  if (session.founder.goals.length) {
    recommendations.push({
      id: uid('rec'),
      title: `Align first missions to: ${session.founder.goals[0]}`,
      reasoning: 'Founder goals should anchor the first Mission Control priorities after onboarding.',
      priority: 'medium',
      category: 'quick-win',
      estimatedImpact: 'moderate',
      sourcePhaseId: 'founder-discovery',
    });
  }

  return recommendations;
}

export function mergeInsights(
  existing: DiscoveryInsight[],
  incoming: DiscoveryInsight[]
): DiscoveryInsight[] {
  const titles = new Set(existing.map((item) => item.title));
  return [...existing, ...incoming.filter((item) => !titles.has(item.title))];
}

export function topInsight(session: DiscoverySession): DiscoveryInsight | null {
  if (!session.insights.length) return null;
  return [...session.insights].sort((a, b) => b.confidence - a.confidence)[0];
}
