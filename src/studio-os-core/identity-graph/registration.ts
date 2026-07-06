import { getOrganizationIdentityGraphProfile } from './store';

export function isIdentityGraphActive(organizationId: string): boolean {
  const profile = getOrganizationIdentityGraphProfile(organizationId);
  return (profile?.peopleCount ?? 0) > 0;
}
