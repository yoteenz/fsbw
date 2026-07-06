import { readFirstEnsure } from '../sync/profile-cache';
import {
  PRESENCE_ENGINE_STORAGE_KEY,
  PRESENCE_ENGINE_VERSION,
  STUDIO_OS_PRESENCE_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationPresenceProfile } from './presence-builder';
import type { OrganizationPresenceProfile, PresenceEngineStore } from './types';

function emptyStore(): PresenceEngineStore {
  return { version: PRESENCE_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_PRESENCE_ENGINE_UPDATED));
  }
}

export function readPresenceEngineStore(): PresenceEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(PRESENCE_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as PresenceEngineStore;
    return { ...emptyStore(), ...parsed, version: PRESENCE_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writePresenceEngineStore(store: PresenceEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PRESENCE_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationPresenceProfile(organizationId: string): OrganizationPresenceProfile | null {
  return readPresenceEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationPresenceProfile): OrganizationPresenceProfile {
  const store = readPresenceEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writePresenceEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncPresenceEngineFromSources(organizationId: string): OrganizationPresenceProfile {
  const profile = upsertProfile(buildOrganizationPresenceProfile(organizationId));
  return profile;
}

export function ensureOrganizationPresenceProfile(organizationId: string): OrganizationPresenceProfile {
  return readFirstEnsure(organizationId, getOrganizationPresenceProfile, syncPresenceEngineFromSources);
}

export function refreshPresenceProfile(organizationId: string): OrganizationPresenceProfile {
  return syncPresenceEngineFromSources(organizationId);
}
