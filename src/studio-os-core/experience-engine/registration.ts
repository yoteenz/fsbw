/** Registration gate — experience scoped per organization atmosphere. */

export function isExperienceEngineInitialized(organizationId: string): boolean {
  return organizationId.length > 0;
}

export function assertExperienceBoundary(organizationId: string, contextOrgId: string): boolean {
  return organizationId === contextOrgId;
}

export function canAdaptExperience(_organizationId: string): boolean {
  return true;
}
