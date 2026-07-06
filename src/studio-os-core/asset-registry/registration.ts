/** Registration gate — assets scoped per organization registry. */

export function isAssetRegistryInitialized(organizationId: string): boolean {
  return organizationId.length > 0;
}

export function assertAssetBoundary(organizationId: string, contextOrgId: string): boolean {
  return organizationId === contextOrgId;
}

export function canAssetRegister(_assetId: string, organizationId: string): boolean {
  return isAssetRegistryInitialized(organizationId);
}
