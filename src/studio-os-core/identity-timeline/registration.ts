import { getOrganizationIdentityTimelineProfile } from './store';

export function isIdentityTimelineActive(organizationId: string): boolean {
  const profile = getOrganizationIdentityTimelineProfile(organizationId);
  return (profile?.peopleWithTimelines ?? 0) > 0;
}
