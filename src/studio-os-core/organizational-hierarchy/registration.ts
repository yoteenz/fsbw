import { getOrganizationHierarchyProfile } from './store';

export function isOrganizationalHierarchyActive(organizationId: string): boolean {
  const profile = getOrganizationHierarchyProfile(organizationId);
  return (profile?.nodesMapped ?? 0) > 0;
}
