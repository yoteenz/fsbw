/** Registration gate — runtime profiles scoped per organization. */

export function isRuntimeInitialized(organizationId: string): boolean {
  return organizationId.length > 0;
}

export function assertRuntimeBoundary(organizationId: string, contextOrgId: string): boolean {
  return organizationId === contextOrgId;
}
