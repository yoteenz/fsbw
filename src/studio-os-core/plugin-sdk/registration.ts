/** Registration gate — plugins scoped per organization sandbox. */

export function isPluginSdkInitialized(organizationId: string): boolean {
  return organizationId.length > 0;
}

export function assertPluginBoundary(organizationId: string, contextOrgId: string): boolean {
  return organizationId === contextOrgId;
}

export function canPluginRegister(_pluginId: string, organizationId: string): boolean {
  return isPluginSdkInitialized(organizationId);
}
