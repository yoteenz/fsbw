/**
 * Asset Registry policy — sole Supabase write target (Genesis §9B.28 Phase 1).
 */

import type { RegistryWritePolicy } from './types';

export const ASSET_REGISTRY_POLICY: RegistryWritePolicy = {
  soleWriteTarget: 'supabase-asset-registry',
  localRegistries: 'read-only-cache',
};

/** Local registries demoted to read-only cache in Phase 1. */
export const DEPRECATED_LOCAL_REGISTRY_KEYS = [
  'studioOsStudioBuilderRegistry_v1',
  'studioOsAssetRegistry_v1',
  'studioOsFoundryRegistry_v1',
] as const;

export type LocalRegistryWriteAttempt = {
  registryKey: string;
  caller: string;
  assetId?: string;
};

export function assertRegistryWritePolicy(attempt: LocalRegistryWriteAttempt): {
  allowed: boolean;
  reason: string;
  policy: RegistryWritePolicy;
} {
  if (DEPRECATED_LOCAL_REGISTRY_KEYS.includes(attempt.registryKey as (typeof DEPRECATED_LOCAL_REGISTRY_KEYS)[number])) {
    return {
      allowed: false,
      reason: `Local registry "${attempt.registryKey}" is read-only cache. Write to Supabase Asset Registry via generation gateway.`,
      policy: ASSET_REGISTRY_POLICY,
    };
  }
  return {
    allowed: true,
    reason: 'Write target not classified as deprecated local registry.',
    policy: ASSET_REGISTRY_POLICY,
  };
}

/** Warn-only helper for transitional local draft caches (Scene Stack exploratory path). */
export function classifyExploratoryDraftStorage(): {
  storageClass: 'local_draft_only';
  canonical: false;
  promotionRequired: true;
} {
  return {
    storageClass: 'local_draft_only',
    canonical: false,
    promotionRequired: true,
  };
}
