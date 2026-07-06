import {
  PREDICTIVE_ORGANIZATION_STORAGE_KEY,
  PREDICTIVE_ORGANIZATION_VERSION,
  STUDIO_OS_PREDICTIVE_ORGANIZATION_UPDATED,
} from './constants';
import { buildOrganizationPredictiveProfile } from './predictive-builder';
import type { OrganizationPredictiveProfile, PredictiveOrganizationStore } from './types';

function emptyStore(): PredictiveOrganizationStore {
  return { version: PREDICTIVE_ORGANIZATION_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_PREDICTIVE_ORGANIZATION_UPDATED));
  }
}

export function readPredictiveOrganizationStore(): PredictiveOrganizationStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(PREDICTIVE_ORGANIZATION_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as PredictiveOrganizationStore;
    return { ...emptyStore(), ...parsed, version: PREDICTIVE_ORGANIZATION_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writePredictiveOrganizationStore(store: PredictiveOrganizationStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PREDICTIVE_ORGANIZATION_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationPredictiveProfile(organizationId: string): OrganizationPredictiveProfile | null {
  return readPredictiveOrganizationStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationPredictiveProfile): OrganizationPredictiveProfile {
  const store = readPredictiveOrganizationStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writePredictiveOrganizationStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncPredictiveOrganizationFromSources(organizationId: string): OrganizationPredictiveProfile {
  return upsertProfile(buildOrganizationPredictiveProfile(organizationId));
}

export function ensureOrganizationPredictiveProfile(organizationId: string): OrganizationPredictiveProfile {
  return syncPredictiveOrganizationFromSources(organizationId);
}

export function refreshPredictiveOrganizationProfile(organizationId: string): OrganizationPredictiveProfile {
  return syncPredictiveOrganizationFromSources(organizationId);
}
