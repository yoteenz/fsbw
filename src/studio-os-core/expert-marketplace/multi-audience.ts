import type { ExpertProfile, MultiAudienceExperience } from './types';

const AUDIENCES: MultiAudienceExperience['audience'][] = [
  'organization',
  'employee',
  'manager',
  'contractor',
  'customer',
  'student',
  'future-owner',
  'future-family',
];

export function generateAudienceExperiences(profile: ExpertProfile): MultiAudienceExperience[] {
  return AUDIENCES.map((audience) => ({
    audience,
    experienceLabel: resolveAudienceLabel(audience, profile),
  }));
}

function resolveAudienceLabel(
  audience: MultiAudienceExperience['audience'],
  profile: ExpertProfile
): string {
  switch (audience) {
    case 'organization':
      return `${profile.organizationName} internal operations — full Profession Brain access.`;
    case 'employee':
      return 'Onboarding, checklists, and decision trees from preserved expertise.';
    case 'manager':
      return 'Leadership development and judgment patterns for oversight.';
    case 'contractor':
      return 'Scoped operational guides without private policy exposure.';
    case 'customer':
      return 'Learn, ask, and prepare before consultations — published surfaces only.';
    case 'student':
      return 'Academy courses and learning paths from the same source of truth.';
    case 'future-owner':
      return 'Institutional memory for succession and ownership transfer.';
    case 'future-family':
      return 'Legacy knowledge preserved across generations.';
    default:
      return profile.originNote;
  }
}
