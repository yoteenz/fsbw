import { readFirstEnsure } from '../sync/profile-cache';
import {
  PERMISSION_ENGINE_STORAGE_KEY,
  PERMISSION_ENGINE_VERSION,
  STUDIO_OS_PERMISSION_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationPermissionEngineProfile } from './engine-profile-builder';
import type { OrganizationPermissionEngineProfile, PermissionAuditRecord, PermissionEngineStore } from './types';

function emptyStore(): PermissionEngineStore {
  return { version: PERMISSION_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_PERMISSION_ENGINE_UPDATED));
  }
}

export function readPermissionEngineStore(): PermissionEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(PERMISSION_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as PermissionEngineStore;
    return { ...emptyStore(), ...parsed, version: PERMISSION_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writePermissionEngineStore(store: PermissionEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PERMISSION_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationPermissionEngineProfile(
  organizationId: string
): OrganizationPermissionEngineProfile | null {
  return readPermissionEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationPermissionEngineProfile): OrganizationPermissionEngineProfile {
  const store = readPermissionEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writePermissionEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild capabilities, roles, contextual rules, and audit from Policy Engine + platform sources */
export function syncPermissionEngineFromSources(organizationId: string): OrganizationPermissionEngineProfile {
  const existing = getOrganizationPermissionEngineProfile(organizationId);
  const rebuilt = buildOrganizationPermissionEngineProfile(organizationId);
  if (existing?.auditHistory?.length) {
    rebuilt.auditHistory = existing.auditHistory;
  }
  if (existing?.approvalChains?.length) {
    rebuilt.approvalChains = existing.approvalChains;
  }
  const profile = upsertProfile(rebuilt);
  return profile;
}

export function ensureOrganizationPermissionEngineProfile(organizationId: string): OrganizationPermissionEngineProfile {
  return readFirstEnsure(organizationId, getOrganizationPermissionEngineProfile, syncPermissionEngineFromSources);
}

export function appendPermissionAuditRecord(
  organizationId: string,
  record: PermissionAuditRecord
): OrganizationPermissionEngineProfile {
  const profile =
    getOrganizationPermissionEngineProfile(organizationId) ?? syncPermissionEngineFromSources(organizationId);
  return upsertProfile({
    ...profile,
    auditHistory: [record, ...profile.auditHistory].slice(0, 100),
    updatedAt: new Date().toISOString(),
  });
}
