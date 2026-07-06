import { readFirstEnsure } from '../sync/profile-cache';
import {
  ANTICIPATION_ENGINE_STORAGE_KEY,
  ANTICIPATION_ENGINE_VERSION,
  STUDIO_OS_ANTICIPATION_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationAnticipationProfile } from './anticipation-builder';
import type { AnticipationEngineStore, OrganizationAnticipationProfile } from './types';

function emptyStore(): AnticipationEngineStore {
  return { version: ANTICIPATION_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_ANTICIPATION_ENGINE_UPDATED));
  }
}

export function readAnticipationEngineStore(): AnticipationEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ANTICIPATION_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as AnticipationEngineStore;
    return { ...emptyStore(), ...parsed, version: ANTICIPATION_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeAnticipationEngineStore(store: AnticipationEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ANTICIPATION_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationAnticipationProfile(
  organizationId: string
): OrganizationAnticipationProfile | null {
  return readAnticipationEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationAnticipationProfile): OrganizationAnticipationProfile {
  const store = readAnticipationEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeAnticipationEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncAnticipationEngineFromSources(organizationId: string): OrganizationAnticipationProfile {
  const profile = upsertProfile(buildOrganizationAnticipationProfile(organizationId));
  return profile;
}

export function ensureOrganizationAnticipationProfile(organizationId: string): OrganizationAnticipationProfile {
  return readFirstEnsure(organizationId, getOrganizationAnticipationProfile, syncAnticipationEngineFromSources);
}

export function refreshAnticipationPreparations(organizationId: string): OrganizationAnticipationProfile {
  return syncAnticipationEngineFromSources(organizationId);
}
