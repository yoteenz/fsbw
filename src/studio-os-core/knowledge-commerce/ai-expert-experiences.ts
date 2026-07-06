import type { OrganizationProfessionBrainProfile } from '../profession-brain/types';
import type { AiExpertExperience } from './types';

export function buildAiExpertExperiences(
  profile: OrganizationProfessionBrainProfile
): AiExpertExperience[] {
  return profile.brains.map((brain) => ({
    id: `aie-${brain.id}`,
    brainId: brain.id,
    expertName: `${brain.label.replace(' Brain', '')} Expert`,
    organizationName: profile.companyName,
    poweredByBrain: brain.label,
    trainedByNote: `Powered by ${profile.companyName} Profession Brain™ — customers understand who trained this expertise and which organization stands behind it.`,
    capabilities: ['learn', 'ask', 'prepare', 'workflow'],
    published: brain.maturityPct >= 40,
    monthlyRevenueUsd: Math.round(brain.maturityPct * 6.5),
  }));
}
