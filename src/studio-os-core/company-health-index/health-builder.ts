import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  computeCategoryHealthScores,
  computeExecutiveHealthScore,
  statusFromScore,
} from './health-scoring';
import { buildProactivePriorities, detectWeakAreas } from './weak-area-detector';
import type { OrganizationHealthIndexProfile } from './types';

export function buildOrganizationHealthIndexProfile(
  organizationId: string
): OrganizationHealthIndexProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const categoryScores = computeCategoryHealthScores(organizationId);
  const executiveHealthScore = computeExecutiveHealthScore(categoryScores);
  const weakAreas = detectWeakAreas(categoryScores);

  const syncedSources = [
    'profession-brain',
    'organization-genome',
    'memory-engine',
    'business-discovery-blueprint',
    'professional-trust-framework',
  ];

  return {
    organizationId,
    companyName: brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase(),
    industryId: brain?.industryId ?? resolveIndustryForWorkspace(organizationId),
    updatedAt: new Date().toISOString(),
    executiveHealthScore,
    executiveStatus: statusFromScore(executiveHealthScore),
    categoryScores,
    weakAreas,
    proactivePriorities: buildProactivePriorities(categoryScores, weakAreas),
    syncedSources,
  };
}
