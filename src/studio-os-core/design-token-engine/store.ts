import {
  DESIGN_TOKEN_ENGINE_STORAGE_KEY,
  DESIGN_TOKEN_ENGINE_VERSION,
  STUDIO_OS_DESIGN_TOKEN_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationDesignTokenEngineProfile } from './engine-profile-builder';
import type { DesignTokenEngineStore, OrganizationDesignTokenEngineProfile } from './types';

function emptyStore(): DesignTokenEngineStore {
  return { version: DESIGN_TOKEN_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_DESIGN_TOKEN_ENGINE_UPDATED));
  }
}

export function readDesignTokenEngineStore(): DesignTokenEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(DESIGN_TOKEN_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as DesignTokenEngineStore;
    return { ...emptyStore(), ...parsed, version: DESIGN_TOKEN_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeDesignTokenEngineStore(store: DesignTokenEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DESIGN_TOKEN_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationDesignTokenEngineProfile(
  organizationId: string
): OrganizationDesignTokenEngineProfile | null {
  return readDesignTokenEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationDesignTokenEngineProfile): OrganizationDesignTokenEngineProfile {
  const store = readDesignTokenEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeDesignTokenEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild design token catalog and governance from Component Registry + theme sources */
export function syncDesignTokenEngineFromSources(
  organizationId: string
): OrganizationDesignTokenEngineProfile {
  return upsertProfile(buildOrganizationDesignTokenEngineProfile(organizationId));
}

export function ensureOrganizationDesignTokenEngineProfile(
  organizationId: string
): OrganizationDesignTokenEngineProfile {
  return syncDesignTokenEngineFromSources(organizationId);
}
