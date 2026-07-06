import { readFirstEnsure } from '../sync/profile-cache';
import {
  AMBIENT_AWARENESS_STORAGE_KEY,
  AMBIENT_AWARENESS_VERSION,
  STUDIO_OS_AMBIENT_AWARENESS_UPDATED,
} from './constants';
import { buildOrganizationAmbientAwarenessProfile } from './awareness-builder';
import type { AmbientAwarenessStore, OrganizationAmbientAwarenessProfile } from './types';

function emptyStore(): AmbientAwarenessStore {
  return { version: AMBIENT_AWARENESS_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_AMBIENT_AWARENESS_UPDATED));
  }
}

export function readAmbientAwarenessStore(): AmbientAwarenessStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(AMBIENT_AWARENESS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as AmbientAwarenessStore;
    return { ...emptyStore(), ...parsed, version: AMBIENT_AWARENESS_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeAmbientAwarenessStore(store: AmbientAwarenessStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(AMBIENT_AWARENESS_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationAmbientAwarenessProfile(
  organizationId: string
): OrganizationAmbientAwarenessProfile | null {
  return readAmbientAwarenessStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationAmbientAwarenessProfile): OrganizationAmbientAwarenessProfile {
  const store = readAmbientAwarenessStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeAmbientAwarenessStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncAmbientAwarenessFromSources(organizationId: string): OrganizationAmbientAwarenessProfile {
  const profile = upsertProfile(buildOrganizationAmbientAwarenessProfile(organizationId));
  return profile;
}

export function ensureOrganizationAmbientAwarenessProfile(organizationId: string): OrganizationAmbientAwarenessProfile {
  return readFirstEnsure(organizationId, getOrganizationAmbientAwarenessProfile, syncAmbientAwarenessFromSources);
}

export function refreshDailyBriefing(organizationId: string): OrganizationAmbientAwarenessProfile {
  return syncAmbientAwarenessFromSources(organizationId);
}
