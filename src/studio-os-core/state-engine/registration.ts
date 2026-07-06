/** Registration gate — lifecycle states scoped per organization. */

export function isStateEngineInitialized(organizationId: string): boolean {
  return organizationId.length > 0;
}

export function assertStateBoundary(organizationId: string, contextOrgId: string): boolean {
  return organizationId === contextOrgId;
}

export function canObjectTransition(
  _objectId: string,
  _from: string,
  _to: string,
  organizationId: string
): boolean {
  return isStateEngineInitialized(organizationId);
}
