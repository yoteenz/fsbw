/**
 * Canonical workspace identity — platform registry IDs vs module tenant IDs.
 * Platform IDs live in WorkspaceProvider / registry.
 * Module tenant IDs live inside milestone store unions (ndxbook, frontal-slayer, …).
 */

export const PLATFORM_WORKSPACE_IDS = [
  'frontal-slayer',
  'ai-media',
  'all-in-one-enterprise',
  'vxd-inc',
  'sandbox',
  'future-brand',
  'future-client',
] as const;

export type PlatformWorkspaceId = (typeof PLATFORM_WORKSPACE_IDS)[number];

/** Module-level tenant IDs used inside studio-os-core milestone stores. */
export type ModuleTenantId = 'frontal-slayer' | 'ndxbook' | 'studio-os' | 'portfolio';

const PLATFORM_TO_MODULE_TENANT: Record<string, ModuleTenantId> = {
  'frontal-slayer': 'frontal-slayer',
  'ai-media': 'ndxbook',
  'all-in-one-enterprise': 'studio-os',
  'vxd-inc': 'portfolio',
  sandbox: 'studio-os',
  'future-brand': 'studio-os',
  'future-client': 'portfolio',
};

/** NDXBOOK brand module id → platform workspace slug. */
export const MODULE_TENANT_TO_PLATFORM: Record<ModuleTenantId, string> = {
  'frontal-slayer': 'frontal-slayer',
  ndxbook: 'ai-media',
  'studio-os': 'all-in-one-enterprise',
  portfolio: 'vxd-inc',
};

export function resolveModuleTenantId(platformWorkspaceId: string): ModuleTenantId {
  return PLATFORM_TO_MODULE_TENANT[platformWorkspaceId] ?? 'studio-os';
}

export function resolvePlatformWorkspaceId(moduleTenantId: string): string {
  if (moduleTenantId in MODULE_TENANT_TO_PLATFORM) {
    return MODULE_TENANT_TO_PLATFORM[moduleTenantId as ModuleTenantId];
  }
  return moduleTenantId;
}

export function isPlatformWorkspaceId(id: string): id is PlatformWorkspaceId {
  return (PLATFORM_WORKSPACE_IDS as readonly string[]).includes(id);
}

export function asModuleTenantId(id: string): ModuleTenantId {
  if (id === 'frontal-slayer' || id === 'ndxbook' || id === 'studio-os' || id === 'portfolio') {
    return id;
  }
  return resolveModuleTenantId(id);
}
