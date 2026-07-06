import {
  STATE_ENGINE_STORAGE_KEY,
  STATE_ENGINE_VERSION,
  STUDIO_OS_STATE_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationStateEngineProfile } from './engine-profile-builder';
import type { OrganizationStateEngineProfile, StateEngineStore } from './types';

function emptyStore(): StateEngineStore {
  return { version: STATE_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_STATE_ENGINE_UPDATED));
  }
}

export function readStateEngineStore(): StateEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STATE_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as StateEngineStore;
    return { ...emptyStore(), ...parsed, version: STATE_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeStateEngineStore(store: StateEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STATE_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationStateEngineProfile(
  organizationId: string
): OrganizationStateEngineProfile | null {
  return readStateEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationStateEngineProfile): OrganizationStateEngineProfile {
  const store = readStateEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeStateEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild lifecycle states, transitions, objects, and history from Workflow Engine + platform sources */
export function syncStateEngineFromSources(organizationId: string): OrganizationStateEngineProfile {
  const profile = upsertProfile(buildOrganizationStateEngineProfile(organizationId));
  void import('../asset-registry/store').then((m) => {
    m.syncAssetRegistryFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationStateEngineProfile(
  organizationId: string
): OrganizationStateEngineProfile {
  return syncStateEngineFromSources(organizationId);
}
