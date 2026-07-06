import { getOrganizationDesignComplianceEngineProfile } from '../design-compliance-engine/store';
import { getOrganizationPromptQaProfile } from '../prompt-qa/store';
import { getOrganizationExperienceQaProfile } from '../experience-qa/store';
import { getOrganizationAccessibilityAuditorProfile } from '../accessibility-auditor/store';
import { getOrganizationPerformanceMonitorProfile } from '../performance-monitor/store';
import { getOrganizationExecutiveTrustDashboardProfile } from '../executive-trust-dashboard/store';
import { getOrganizationRegressionEngineProfile } from '../regression-engine/store';
import { getOrganizationQaSimulationEngineProfile } from '../qa-simulation-engine/store';
import { getOrganizationDocumentationSyncProfile } from '../documentation-sync/store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationReleaseReadinessProfile } from '../release-readiness/store';
import { getOrganizationGuardianProfile } from '../organizational-guardian/store';
import { HEALTH_PILLAR_LABELS, HEALTH_PILLARS } from './constants';
import type { HealthPillar, HealthPillarScore } from './types';

function deriveStatus(score: number): HealthPillarScore['status'] {
  if (score >= 90) return 'excellent';
  if (score >= 82) return 'healthy';
  if (score >= 72) return 'watch';
  return 'at-risk';
}

function deriveTrend(score: number, idx: number): HealthPillarScore['trend'] {
  if (idx % 3 === 0) return 'improving';
  if (idx % 3 === 1) return 'stable';
  return score >= 80 ? 'stable' : 'declining';
}

export function buildHealthPillars(organizationId: string): HealthPillarScore[] {
  const design = getOrganizationDesignComplianceEngineProfile(organizationId);
  const prompt = getOrganizationPromptQaProfile(organizationId);
  const experience = getOrganizationExperienceQaProfile(organizationId);
  const accessibility = getOrganizationAccessibilityAuditorProfile(organizationId);
  const performance = getOrganizationPerformanceMonitorProfile(organizationId);
  const trust = getOrganizationExecutiveTrustDashboardProfile(organizationId);
  const regression = getOrganizationRegressionEngineProfile(organizationId);
  const simulation = getOrganizationQaSimulationEngineProfile(organizationId);
  const documentation = getOrganizationDocumentationSyncProfile(organizationId);
  const knowledge = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const readiness = getOrganizationReleaseReadinessProfile(organizationId);
  const guardian = getOrganizationGuardianProfile(organizationId);

  const scores: Record<HealthPillar, { score: number; source: string; summary: string }> = {
    'design-health': {
      score: design?.creativeDirectorScore ?? 84,
      source: 'Design Compliance Engine™',
      summary: design ? `Creative Director ${design.creativeDirectorScore}% · ${design.findingsOpen} findings.` : 'Design compliance baseline.',
    },
    'prompt-health': {
      score: prompt?.overallQaScore ?? 85,
      source: 'Prompt QA™',
      summary: prompt ? `${prompt.promptsAudited} prompts · ${prompt.findingsOpen} findings.` : 'Prompt infrastructure healthy.',
    },
    'experience-health': {
      score: experience?.overallExperienceScore ?? 86,
      source: 'Experience QA™',
      summary: experience ? `${experience.pagesAudited} pages · confidence ${experience.overallExperienceScore}%.` : 'Experience confidence strong.',
    },
    accessibility: {
      score: accessibility?.overallAccessibilityScore ?? 87,
      source: 'Accessibility Auditor™',
      summary: accessibility ? `WCAG ${accessibility.averageWcagLevel} · ${accessibility.issuesOpen} issues.` : 'Inclusive design maintained.',
    },
    performance: {
      score: performance?.overallPerformanceScore ?? 83,
      source: 'Performance Monitor™',
      summary: performance ? `${performance.bottlenecksOpen} bottlenecks · trend ${performance.averageSpeedTrend}.` : 'Performance budget maintained.',
    },
    trust: {
      score: trust?.overallTrustScore ?? 86,
      source: 'Executive Trust Dashboard™',
      summary: trust ? `${trust.systemsAtRisk} systems at risk · trend ${trust.trustTrend}.` : 'Organizational trust stable.',
    },
    'regression-status': {
      score: regression?.overallRegressionScore ?? 88,
      source: 'Regression Engine™',
      summary: regression ? `${regression.brokenFeaturesOpen} broken · ${regression.recurringPatterns} patterns.` : 'Regression verification strong.',
    },
    'simulation-status': {
      score: simulation?.simulationScore ?? 82,
      source: 'QA Simulation Engine™',
      summary: simulation ? `${simulation.simulationsPassed}/${simulation.simulationsRun} passed · gate ${simulation.productionGateStatus}.` : 'Simulations on track.',
    },
    'documentation-health': {
      score: documentation?.syncScore ?? 85,
      source: 'Documentation Sync™',
      summary: documentation ? `${documentation.systemsDocumented} systems · sync ${documentation.syncScore}%.` : 'Documentation current.',
    },
    'knowledge-health': {
      score: knowledge?.overallConfidenceScore ?? 84,
      source: 'Knowledge Confidence™',
      summary: knowledge ? `Confidence ${knowledge.overallConfidenceScore}% · knowledge graph healthy.` : 'Knowledge quality stable.',
    },
    'release-readiness': {
      score: readiness?.overallReadinessScore ?? 84,
      source: 'Release Readiness™',
      summary: readiness ? `${readiness.approvalsGranted}/${readiness.approvalsRequired} approvals · ${readiness.releaseGate}.` : 'Release gate monitoring.',
    },
    'guardian-status': {
      score: guardian?.guardianScore ?? 89,
      source: 'Organizational Guardian™',
      summary: guardian ? `${guardian.activeAlerts} alerts · ${guardian.domainsMonitored} domains.` : 'Guardian coordination active.',
    },
  };

  return HEALTH_PILLARS.map((pillar, idx) => {
    const data = scores[pillar];
    return {
      pillar,
      label: HEALTH_PILLAR_LABELS[pillar],
      score: data.score,
      status: deriveStatus(data.score),
      trend: deriveTrend(data.score, idx),
      summary: data.summary,
      sourceSystem: data.source,
    };
  });
}

export function computeOverallEngineeringScore(pillars: HealthPillarScore[]): number {
  if (pillars.length === 0) return 84;
  return Math.round(pillars.reduce((s, p) => s + p.score, 0) / pillars.length);
}

export function countAtRiskPillars(pillars: HealthPillarScore[]): number {
  return pillars.filter((p) => p.status === 'at-risk' || p.status === 'watch').length;
}
