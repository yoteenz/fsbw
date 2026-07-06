import {
  ASSET_REGISTRY_STORAGE_KEY,
  ASSET_REGISTRY_VERSION,
  STUDIO_OS_ASSET_REGISTRY_UPDATED,
} from './constants';
import { buildOrganizationAssetRegistryProfile } from './engine-profile-builder';
import type { OrganizationAssetRegistryProfile, AssetRegistryStore } from './types';

function emptyStore(): AssetRegistryStore {
  return { version: ASSET_REGISTRY_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_ASSET_REGISTRY_UPDATED));
  }
}

export function readAssetRegistryStore(): AssetRegistryStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ASSET_REGISTRY_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as AssetRegistryStore;
    return { ...emptyStore(), ...parsed, version: ASSET_REGISTRY_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeAssetRegistryStore(store: AssetRegistryStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ASSET_REGISTRY_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationAssetRegistryProfile(
  organizationId: string
): OrganizationAssetRegistryProfile | null {
  return readAssetRegistryStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationAssetRegistryProfile): OrganizationAssetRegistryProfile {
  const store = readAssetRegistryStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeAssetRegistryStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild asset catalog, metadata, versioning, and health from State Engine + platform sources */
export function syncAssetRegistryFromSources(organizationId: string): OrganizationAssetRegistryProfile {
  return upsertProfile(buildOrganizationAssetRegistryProfile(organizationId));
}

export function ensureOrganizationAssetRegistryProfile(
  organizationId: string
): OrganizationAssetRegistryProfile {
  return syncAssetRegistryFromSources(organizationId);
}
