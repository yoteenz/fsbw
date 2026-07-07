import { getOrganizationProfessionalProfilesProfile } from './store';

export function isProfessionalProfileActive(organizationId: string): boolean {
  const profile = getOrganizationProfessionalProfilesProfile(organizationId);
  return (profile?.profilesCount ?? 0) > 0;
}
