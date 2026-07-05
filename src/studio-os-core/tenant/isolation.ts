/**
 * Multi-tenant isolation — every workspace remains isolated.
 * Knowledge, executives, concierges, customers, media, campaigns, analytics,
 * permissions, branding, voice, AI memory, and organization genome are scoped per workspace.
 */

import { scopeStorageKey } from '../workspace/storage';

export type TenantIsolationDomain =
  | 'knowledge'
  | 'executives'
  | 'concierges'
  | 'customers'
  | 'media'
  | 'campaigns'
  | 'analytics'
  | 'permissions'
  | 'branding'
  | 'voice'
  | 'ai-memory'
  | 'organization-genome';

const DOMAIN_PREFIX: Record<TenantIsolationDomain, string> = {
  knowledge: 'knowledge',
  executives: 'executives',
  concierges: 'concierges',
  customers: 'customers',
  media: 'media',
  campaigns: 'campaigns',
  analytics: 'analytics',
  permissions: 'permissions',
  branding: 'branding',
  voice: 'voice',
  'ai-memory': 'aiMemory',
  'organization-genome': 'genome',
};

/** Scoped storage key for a tenant domain — no workspace may read another's keys. */
export function tenantScopedKey(
  domain: TenantIsolationDomain,
  baseKey: string,
  workspaceId?: string
): string {
  return scopeStorageKey(`${DOMAIN_PREFIX[domain]}_${baseKey}`, workspaceId);
}

/** Guard: returns false when attempting cross-workspace access without explicit permission. */
export function assertTenantAccess(
  requestingWorkspaceId: string,
  resourceWorkspaceId: string,
  explicitlyPermitted = false
): boolean {
  if (requestingWorkspaceId === resourceWorkspaceId) return true;
  return explicitlyPermitted;
}
