import { getOrganizationAmbientAwarenessProfile } from '../ambient-awareness/store';
import { getOrganizationAutonomousPreparationProfile } from '../autonomous-preparation/store';
import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { getOrganizationFounderCognitiveLoadProfile } from '../founder-cognitive-load/store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationPredictiveProfile } from '../predictive-organization/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationRelationshipMemoryProfile } from '../relationship-memory/store';
import { REASONING_FACTOR_LABELS, REASONING_FACTORS } from './constants';
import type { HolisticRecommendation, ReasoningFactor, ReasoningFactorSnapshot } from './types';

export function buildReasoningContext(organizationId: string): ReasoningFactorSnapshot[] {
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const genome = getOrganizationGenomeProfile(organizationId);
  const relationship = getOrganizationRelationshipMemoryProfile(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  const confidence = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const cognitive = getOrganizationFounderCognitiveLoadProfile(organizationId);
  const ambient = getOrganizationAmbientAwarenessProfile(organizationId);
  const predictive = getOrganizationPredictiveProfile(organizationId);
  const preparation = getOrganizationAutonomousPreparationProfile(organizationId);

  const factors: Record<ReasoningFactor, ReasoningFactorSnapshot> = {
    'organizational-history': {
      factor: 'organizational-history',
      label: REASONING_FACTOR_LABELS['organizational-history'],
      insight: blueprint
        ? `Blueprint ${blueprint.overallProgressPct}% complete — founding DNA informs every recommendation.`
        : 'Organizational history accumulating from Memory Engine and Legacy Vault.',
      weightPct: 82,
      considered: true,
    },
    'current-priorities': {
      factor: 'current-priorities',
      label: REASONING_FACTOR_LABELS['current-priorities'],
      insight: ambient
        ? `Founder focus: ${ambient.intelligentContext.founderFocus} · ${ambient.dailyBriefing.topPriority}`
        : 'Priorities derived from Ambient Awareness and Organization Pulse.',
      weightPct: 90,
      considered: true,
    },
    'founder-preferences': {
      factor: 'founder-preferences',
      label: REASONING_FACTOR_LABELS['founder-preferences'],
      insight: relationship
        ? `${relationship.preferencesLearned} preferences learned · ${relationship.dockAdaptationLine.slice(0, 70)}…`
        : 'Relationship Memory calibrating founder working style.',
      weightPct: 88,
      considered: true,
    },
    'profession-brain': {
      factor: 'profession-brain',
      label: REASONING_FACTOR_LABELS['profession-brain'],
      insight: brain
        ? `${brain.brains.length} Profession Brain(s) — institutional expertise governs policy recommendations.`
        : 'Profession Brain seeding from Blueprint services.',
      weightPct: 85,
      considered: true,
    },
    'organization-genome': {
      factor: 'organization-genome',
      label: REASONING_FACTOR_LABELS['organization-genome'],
      insight: genome
        ? `Mission: ${genome.identityCore.mission.slice(0, 60)}… · risk ${genome.decisionDna.riskTolerance}.`
        : 'Genome identity layers building from charter and Blueprint.',
      weightPct: 80,
      considered: true,
    },
    'relationship-memory': {
      factor: 'relationship-memory',
      label: REASONING_FACTOR_LABELS['relationship-memory'],
      insight: relationship
        ? `${relationship.relationshipsTracked} relationships tracked · familiarity ${relationship.familiarityScore}%.`
        : 'Relationship patterns emerging through observation.',
      weightPct: 76,
      considered: true,
    },
    'executive-council': {
      factor: 'executive-council',
      label: REASONING_FACTOR_LABELS['executive-council'],
      insight: council
        ? `${council.pendingDecisions} collaborative council decision(s) inform strategic recommendations.`
        : 'Executive Council available for multi-perspective guidance.',
      weightPct: 74,
      considered: true,
    },
    'knowledge-confidence': {
      factor: 'knowledge-confidence',
      label: REASONING_FACTOR_LABELS['knowledge-confidence'],
      insight: confidence
        ? `Overall confidence ${confidence.overallConfidenceScore}% · ${confidence.brainsNeedingTeaching} brain(s) need teaching.`
        : 'Knowledge Confidence establishing trust transparency.',
      weightPct: 78,
      considered: true,
    },
    'current-workload': {
      factor: 'current-workload',
      label: REASONING_FACTOR_LABELS['current-workload'],
      insight: cognitive
        ? `Cognitive demand ${cognitive.cognitiveDemandPct}% · ${cognitive.loadState} load · ${preparation?.awaitingApprovalCount ?? 0} prep(s) queued.`
        : 'Workload monitored through Founder Cognitive Load and preparation queue.',
      weightPct: 86,
      considered: true,
    },
    'long-term-goals': {
      factor: 'long-term-goals',
      label: REASONING_FACTOR_LABELS['long-term-goals'],
      insight: genome
        ? `Objectives: ${genome.identityCore.longTermObjectives.slice(0, 2).join(' · ') || 'Blueprint-derived growth path'}.`
        : predictive
          ? `90-day forecast aligned with predictive score ${predictive.predictiveScore}%.`
          : 'Long-term goals from Genome and Blueprint growth chapters.',
      weightPct: 84,
      considered: true,
    },
  };

  return REASONING_FACTORS.map((f) => factors[f]);
}

export function buildHolisticRecommendations(
  organizationId: string,
  reasoning: ReasoningFactorSnapshot[]
): HolisticRecommendation[] {
  const predictive = getOrganizationPredictiveProfile(organizationId);
  const preparation = getOrganizationAutonomousPreparationProfile(organizationId);
  const health = getOrganizationHealthIndexProfile(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  const relationship = getOrganizationRelationshipMemoryProfile(organizationId);

  const recommendations: HolisticRecommendation[] = [];

  if (preparation && preparation.awaitingApprovalCount > 0) {
    recommendations.push({
      id: `holistic-${organizationId}-prep`,
      recommendation: preparation.dockPreparationLine,
      reasoning: 'Unified: Predictive Organization + Autonomous Preparation + Relationship Memory preferences.',
      factorsConsidered: ['current-priorities', 'founder-preferences', 'current-workload'],
      confidencePct: 88,
      holistic: true,
    });
  }

  if (predictive?.predictions[0]) {
    const top = predictive.predictions[0];
    recommendations.push({
      id: `holistic-${organizationId}-predict`,
      recommendation: `${top.recommendedAction} (${top.prediction})`,
      reasoning: `Holistic reasoning: ${top.reasoning} · Genome long-term goals · Council alignment.`,
      factorsConsidered: ['organizational-history', 'long-term-goals', 'executive-council', 'knowledge-confidence'],
      confidencePct: top.confidencePct,
      holistic: true,
    });
  }

  if (health?.weakAreas[0]) {
    recommendations.push({
      id: `holistic-${organizationId}-health`,
      recommendation: `Address ${health.weakAreas[0].label} proactively — ${health.weakAreas[0].proactiveAction}`,
      reasoning: 'Company Health Index + Pulse + Profession Brain expertise combined — not an isolated alert.',
      factorsConsidered: ['organizational-history', 'current-priorities', 'profession-brain', 'knowledge-confidence'],
      confidencePct: 80,
      holistic: true,
    });
  }

  if (council && council.pendingDecisions > 0) {
    recommendations.push({
      id: `holistic-${organizationId}-council`,
      recommendation: `Convene Executive Council — ${council.pendingDecisions} decision(s) benefit from collaborative intelligence.`,
      reasoning: 'Council recommendations weighted with founder preferences and current workload protection.',
      factorsConsidered: ['executive-council', 'founder-preferences', 'current-workload', 'organization-genome'],
      confidencePct: 82,
      holistic: true,
    });
  }

  if (relationship?.adaptationInsights[0]) {
    recommendations.push({
      id: `holistic-${organizationId}-familiarity`,
      recommendation: relationship.adaptationInsights[0].dockApplication,
      reasoning: relationship.adaptationInsights[0].insight,
      factorsConsidered: ['founder-preferences', 'relationship-memory', 'organizational-history'],
      confidencePct: relationship.adaptationInsights[0].confidencePct,
      holistic: true,
    });
  }

  recommendations.push({
    id: `holistic-${organizationId}-legacy`,
    recommendation: 'PRESERVE EXPERTISE. BUILD LEGACY. — every decision strengthens organizational consciousness for generations.',
    reasoning: reasoning
      .slice(0, 4)
      .map((r) => r.insight.slice(0, 50))
      .join(' · '),
    factorsConsidered: ['organizational-history', 'long-term-goals', 'profession-brain', 'knowledge-confidence'],
    confidencePct: 95,
    holistic: true,
  });

  return recommendations.slice(0, 6);
}

export function summarizeReasoningContext(reasoning: ReasoningFactorSnapshot[]): string {
  return `${reasoning.length} factors considered before every recommendation — holistic, never isolated.`;
}
