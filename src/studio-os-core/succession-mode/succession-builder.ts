import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildKnowledgeDependencyMap } from './dependency-map';
import { assessLegacyContinuity } from './legacy-continuity';
import {
  computeOverallSuccessionReadiness,
  computeSuccessionDimensionScores,
  estimateFounderDependencyPct,
  statusFromScore,
} from './readiness-scoring';
import { buildSuccessionRecommendations } from './recommendations-engine';
import type { OrganizationSuccessionProfile } from './types';

export function buildOrganizationSuccessionProfile(organizationId: string): OrganizationSuccessionProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const dimensionScores = computeSuccessionDimensionScores(organizationId);
  const knowledgeDependencies = buildKnowledgeDependencyMap(organizationId);
  const overallSuccessionReadiness = computeOverallSuccessionReadiness(dimensionScores);
  const founderDependencyPct = estimateFounderDependencyPct(dimensionScores, knowledgeDependencies.length);

  return {
    organizationId,
    companyName: brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase(),
    industryId: brain?.industryId ?? resolveIndustryForWorkspace(organizationId),
    updatedAt: new Date().toISOString(),
    overallSuccessionReadiness,
    overallStatus: statusFromScore(overallSuccessionReadiness),
    dimensionScores,
    knowledgeDependencies,
    recommendations: buildSuccessionRecommendations(dimensionScores, knowledgeDependencies),
    legacyContinuity: assessLegacyContinuity(organizationId, dimensionScores, overallSuccessionReadiness),
    founderDependencyPct,
    syncedSources: [
      'profession-brain',
      'organization-genome',
      'memory-engine',
      'business-discovery-blueprint',
      'company-health-index',
      'studio-institute',
    ],
  };
}
