import { readFirstEnsure } from '../sync/profile-cache';
import {
  INTERACTION_ENGINE_STORAGE_KEY,
  INTERACTION_ENGINE_VERSION,
  STUDIO_OS_INTERACTION_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationInteractionEngineProfile } from './engine-profile-builder';
import type { InteractionEngineStore, OrganizationInteractionEngineProfile } from './types';

function emptyStore(): InteractionEngineStore {
  return { version: INTERACTION_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_INTERACTION_ENGINE_UPDATED));
  }
}

export function readInteractionEngineStore(): InteractionEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(INTERACTION_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as InteractionEngineStore;
    return { ...emptyStore(), ...parsed, version: INTERACTION_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeInteractionEngineStore(store: InteractionEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(INTERACTION_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationInteractionEngineProfile(
  organizationId: string
): OrganizationInteractionEngineProfile | null {
  return readInteractionEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationInteractionEngineProfile): OrganizationInteractionEngineProfile {
  const store = readInteractionEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeInteractionEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild interaction catalog and governance from Component Registry + platform sources */
export function syncInteractionEngineFromSources(
  organizationId: string
): OrganizationInteractionEngineProfile {
  const profile = upsertProfile(buildOrganizationInteractionEngineProfile(organizationId));
  return profile;
}

export function ensureOrganizationInteractionEngineProfile(organizationId: string): OrganizationInteractionEngineProfile {
  return readFirstEnsure(organizationId, getOrganizationInteractionEngineProfile, syncInteractionEngineFromSources);
}
