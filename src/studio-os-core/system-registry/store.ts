import {
  SYSTEM_REGISTRY_STORAGE_KEY,
  SYSTEM_REGISTRY_VERSION,
  STUDIO_OS_SYSTEM_REGISTRY_UPDATED,
} from './constants';
import { buildOrganizationSystemRegistryProfile } from './registry-profile-builder';
import type { OrganizationSystemRegistryProfile, SystemRegistryStore } from './types';

function emptyStore(): SystemRegistryStore {
  return { version: SYSTEM_REGISTRY_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_SYSTEM_REGISTRY_UPDATED));
  }
}

export function readSystemRegistryStore(): SystemRegistryStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(SYSTEM_REGISTRY_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as SystemRegistryStore;
    return { ...emptyStore(), ...parsed, version: SYSTEM_REGISTRY_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeSystemRegistryStore(store: SystemRegistryStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SYSTEM_REGISTRY_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationSystemRegistryProfile(
  organizationId: string
): OrganizationSystemRegistryProfile | null {
  return readSystemRegistryStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationSystemRegistryProfile): OrganizationSystemRegistryProfile {
  const store = readSystemRegistryStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeSystemRegistryStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild master system index from all Studio OS sources */
export function syncSystemRegistryFromSources(organizationId: string): OrganizationSystemRegistryProfile {
  const profile = upsertProfile(buildOrganizationSystemRegistryProfile(organizationId));
  void import('../component-registry/store').then((m) => {
    m.syncComponentRegistryFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationSystemRegistryProfile(
  organizationId: string
): OrganizationSystemRegistryProfile {
  return syncSystemRegistryFromSources(organizationId);
}
