import { getOrganizationRoleIntelligenceProfile } from './store';

export function isRoleIntelligenceActive(organizationId: string): boolean {
  const profile = getOrganizationRoleIntelligenceProfile(organizationId);
  return (profile?.rolesDefined ?? 0) > 0;
}
