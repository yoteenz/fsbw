import { getOrganizationSkillGraphProfile } from './store';

export function isSkillGraphActive(organizationId: string): boolean {
  const profile = getOrganizationSkillGraphProfile(organizationId);
  return (profile?.skillsTracked ?? 0) > 0;
}
