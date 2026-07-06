import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildLearningRecommendations } from './improvement-engine';
import { buildProfessionBrainConfidenceProfile } from './confidence-scoring';
import type { OrganizationKnowledgeConfidenceProfile } from './types';

export function buildOrganizationKnowledgeConfidenceProfile(
  organizationId: string
): OrganizationKnowledgeConfidenceProfile {
  const brainProfile = getOrganizationProfessionBrainProfile(organizationId);
  const humanKnowledge = brainProfile?.humanKnowledge ?? [];
  const academyModules = brainProfile?.academyModules ?? [];
  const brains = brainProfile?.brains ?? [];

  const brainProfiles = brains.map((brain) => {
    const humanCount = humanKnowledge.filter((h) => h.brainId === brain.id).length;
    const academyCount = academyModules.filter((m) => m.brainId === brain.id).length;
    return buildProfessionBrainConfidenceProfile(brain, humanCount, academyCount);
  });

  const learningRecommendations = buildLearningRecommendations(brainProfiles);
  const overallConfidenceScore =
    brainProfiles.length > 0
      ? Math.round(
          brainProfiles.reduce((s, b) => s + b.overallConfidenceScore, 0) / brainProfiles.length
        )
      : 0;

  return {
    organizationId,
    companyName: brainProfile?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase(),
    industryId: brainProfile?.industryId ?? resolveIndustryForWorkspace(organizationId),
    updatedAt: new Date().toISOString(),
    overallConfidenceScore,
    brainsAssessed: brainProfiles.length,
    brainsNeedingTeaching: brainProfiles.filter((b) => b.overallConfidenceScore < 75).length,
    brainProfiles,
    learningRecommendations,
    syncedSources: [
      'profession-brain',
      'studio-institute',
      'memory-engine',
      'wisdom-capture',
      'shadow-mode',
      'business-discovery-blueprint',
    ],
  };
}
