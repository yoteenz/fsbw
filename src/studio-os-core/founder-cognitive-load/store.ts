import {
  FOUNDER_COGNITIVE_LOAD_STORAGE_KEY,
  FOUNDER_COGNITIVE_LOAD_VERSION,
  STUDIO_OS_FOUNDER_COGNITIVE_LOAD_UPDATED,
} from './constants';
import { buildOrganizationFounderCognitiveLoadProfile } from './cognitive-load-builder';
import type { FounderCognitiveLoadStore, OrganizationFounderCognitiveLoadProfile } from './types';

function emptyStore(): FounderCognitiveLoadStore {
  return { version: FOUNDER_COGNITIVE_LOAD_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_FOUNDER_COGNITIVE_LOAD_UPDATED));
  }
}

export function readFounderCognitiveLoadStore(): FounderCognitiveLoadStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(FOUNDER_COGNITIVE_LOAD_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as FounderCognitiveLoadStore;
    return { ...emptyStore(), ...parsed, version: FOUNDER_COGNITIVE_LOAD_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeFounderCognitiveLoadStore(store: FounderCognitiveLoadStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(FOUNDER_COGNITIVE_LOAD_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationFounderCognitiveLoadProfile(
  organizationId: string
): OrganizationFounderCognitiveLoadProfile | null {
  return readFounderCognitiveLoadStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationFounderCognitiveLoadProfile): OrganizationFounderCognitiveLoadProfile {
  const store = readFounderCognitiveLoadStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeFounderCognitiveLoadStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncFounderCognitiveLoadFromSources(organizationId: string): OrganizationFounderCognitiveLoadProfile {
  const profile = upsertProfile(buildOrganizationFounderCognitiveLoadProfile(organizationId));
  void import('../presence-engine/store').then((m) => {
    m.syncPresenceEngineFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationFounderCognitiveLoadProfile(
  organizationId: string
): OrganizationFounderCognitiveLoadProfile {
  return syncFounderCognitiveLoadFromSources(organizationId);
}

export function refreshFounderCognitiveLoad(organizationId: string): OrganizationFounderCognitiveLoadProfile {
  return syncFounderCognitiveLoadFromSources(organizationId);
}
