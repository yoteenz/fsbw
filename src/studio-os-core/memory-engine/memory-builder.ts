import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { seedMemoryRecordsFromSources } from './memory-seeds';
import { buildArtifactsFromCompletedProjects } from './project-retrospective';
import {
  buildCompoundingRecommendations,
  computeMemoryDepthScore,
} from './recommendation-engine';
import type { OrganizationMemoryProfile } from './types';

export function buildOrganizationMemoryProfile(organizationId: string): OrganizationMemoryProfile {
  const brainProfile = getOrganizationProfessionBrainProfile(organizationId);
  const companyName =
    brainProfile?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brainProfile?.industryId ?? resolveIndustryForWorkspace(organizationId);
  const now = new Date().toISOString();

  const records = seedMemoryRecordsFromSources(organizationId, companyName);
  const projectArtifacts = buildArtifactsFromCompletedProjects(records);
  const compoundingRecommendations = buildCompoundingRecommendations(records, projectArtifacts);
  const totalLessonsCaptured = records.filter((r) => r.type === 'lesson').length + projectArtifacts.length;

  return {
    organizationId,
    companyName,
    industryId,
    updatedAt: now,
    brainSyncedAt: brainProfile?.updatedAt,
    records,
    projectArtifacts,
    compoundingRecommendations,
    memoryDepthScore: computeMemoryDepthScore(records, projectArtifacts.length),
    totalProjectsArchived: projectArtifacts.length,
    totalLessonsCaptured,
  };
}
