import type { OrbRecommendation } from '../../orb-recommendations/types';
import { ORB_DISCOVERY_CONTEXT_LINES } from '../constants';
import { getBusinessDiscoveryState } from '../discovery-engine/orchestrator';
import type { BusinessDiscoveryState, DiscoverySession } from '../types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildDiscoveryOrbLine(session: DiscoverySession): string | null {
  if (session.generatedHeadquarters?.maturityLevel === 'ready') {
    return 'Your first Headquarters is ready — welcome to your company\'s new home.';
  }
  if (session.companyGenome && session.genomeCompletionPercent >= 70) {
    return 'Your Company Genome™ is taking form — ready to preview Headquarters?';
  }
  if (session.insights.some((insight) => insight.founderMoment?.includes('bottleneck'))) {
    return 'We discovered hidden bottlenecks — worth reviewing before the next phase.';
  }
  const unanswered = session.progress.find((phase) => phase.status === 'in-progress');
  if (unanswered) {
    return ORB_DISCOVERY_CONTEXT_LINES[session.overallProgressPercent % ORB_DISCOVERY_CONTEXT_LINES.length];
  }
  return null;
}

export function buildBusinessDiscoveryOrbRecommendations(
  state: BusinessDiscoveryState | null,
  organizationId: string
): OrbRecommendation[] {
  if (!state) return [];

  const { session, nextQuestions, topInsight } = state;
  const recs: OrbRecommendation[] = [];

  if (nextQuestions.length > 0 && session.status !== 'complete') {
    const next = nextQuestions[0];
    recs.push({
      id: uid('orb-bd'),
      title: `Continue discovery: ${next.prompt.slice(0, 60)}${next.prompt.length > 60 ? '…' : ''}`,
      reasoning: next.intent,
      category: 'surprise-discovery',
      priority: session.overallProgressPercent < 30 ? 'high' : 'medium',
      estimatedImpact: 'high',
      estimatedMinutes: 8,
      estimatedCost: '$0',
      potentialSavings: null,
      departmentsAffected: ['Executive', 'Operations'],
      creativeEquityGained: null,
      confidenceScore: 88,
      targetPath: '/admin/studio/business-discovery',
      actionable: true,
    });
  }

  if (topInsight?.founderMoment) {
    recs.push({
      id: uid('orb-bd'),
      title: topInsight.founderMoment,
      reasoning: topInsight.summary,
      category: 'celebrate-milestone',
      priority: 'medium',
      estimatedImpact: 'moderate',
      estimatedMinutes: 3,
      estimatedCost: '$0',
      potentialSavings: null,
      departmentsAffected: ['Executive'],
      creativeEquityGained: null,
      confidenceScore: topInsight.confidence,
      targetPath: '/admin/studio/business-discovery',
      actionable: true,
    });
  }

  if (session.generatedHeadquarters && session.status !== 'complete') {
    recs.push({
      id: uid('orb-bd'),
      title: 'Review Headquarters preview',
      reasoning: session.generatedHeadquarters.description,
      category: 'expand-headquarters',
      priority: 'high',
      estimatedImpact: 'transformative',
      estimatedMinutes: 15,
      estimatedCost: '$0',
      potentialSavings: null,
      departmentsAffected: ['Executive', 'Operations', 'Knowledge'],
      creativeEquityGained: null,
      confidenceScore: 92,
      targetPath: '/admin/studio/business-discovery',
      actionable: true,
    });
  }

  if (!state && organizationId) {
    recs.push({
      id: uid('orb-bd'),
      title: 'Begin Business Discovery™',
      reasoning: 'Replace SaaS setup with a strategy session that produces your Company Genome™.',
      category: 'surprise-discovery',
      priority: 'high',
      estimatedImpact: 'transformative',
      estimatedMinutes: 45,
      estimatedCost: '$0',
      potentialSavings: null,
      departmentsAffected: ['Executive'],
      creativeEquityGained: null,
      confidenceScore: 95,
      targetPath: '/admin/studio/business-discovery',
      actionable: true,
    });
  }

  return recs;
}

export function readTopBusinessDiscoveryAmbientLine(organizationId: string): string | null {
  const state = getBusinessDiscoveryState(organizationId);
  return buildDiscoveryOrbLine(state.session);
}
