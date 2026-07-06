import {
  COMPONENT_REGISTRY_STORAGE_KEY,
  COMPONENT_REGISTRY_VERSION,
  STUDIO_OS_COMPONENT_REGISTRY_UPDATED,
} from './constants';
import { buildOrganizationComponentRegistryProfile } from './registry-profile-builder';
import type { ComponentRegistryStore, OrganizationComponentRegistryProfile } from './types';

function emptyStore(): ComponentRegistryStore {
  return { version: COMPONENT_REGISTRY_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_COMPONENT_REGISTRY_UPDATED));
  }
}

export function readComponentRegistryStore(): ComponentRegistryStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(COMPONENT_REGISTRY_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ComponentRegistryStore;
    return { ...emptyStore(), ...parsed, version: COMPONENT_REGISTRY_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeComponentRegistryStore(store: ComponentRegistryStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(COMPONENT_REGISTRY_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationComponentRegistryProfile(
  organizationId: string
): OrganizationComponentRegistryProfile | null {
  return readComponentRegistryStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationComponentRegistryProfile): OrganizationComponentRegistryProfile {
  const store = readComponentRegistryStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeComponentRegistryStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild component catalog from Executive IA, platform, and Mission Control sources */
export function syncComponentRegistryFromSources(
  organizationId: string
): OrganizationComponentRegistryProfile {
  return upsertProfile(buildOrganizationComponentRegistryProfile(organizationId));
}

export function ensureOrganizationComponentRegistryProfile(
  organizationId: string
): OrganizationComponentRegistryProfile {
  return syncComponentRegistryFromSources(organizationId);
}
