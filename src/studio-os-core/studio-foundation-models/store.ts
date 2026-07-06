import { readFirstEnsure } from '../sync/profile-cache';
import {
  STUDIO_FOUNDATION_MODELS_STORAGE_KEY,
  STUDIO_FOUNDATION_MODELS_VERSION,
  STUDIO_OS_STUDIO_FOUNDATION_MODELS_UPDATED,
} from './constants';
import { buildOrganizationStudioFoundationModelsProfile } from './models-builder';
import type {
  OrganizationStudioFoundationModelsProfile,
  StudioFoundationModelsStore,
} from './types';

function emptyStore(): StudioFoundationModelsStore {
  return { version: STUDIO_FOUNDATION_MODELS_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_STUDIO_FOUNDATION_MODELS_UPDATED));
  }
}

export function readStudioFoundationModelsStore(): StudioFoundationModelsStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STUDIO_FOUNDATION_MODELS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as StudioFoundationModelsStore;
    return { ...emptyStore(), ...parsed, version: STUDIO_FOUNDATION_MODELS_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeStudioFoundationModelsStore(store: StudioFoundationModelsStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STUDIO_FOUNDATION_MODELS_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationStudioFoundationModelsProfile(
  organizationId: string
): OrganizationStudioFoundationModelsProfile | null {
  return readStudioFoundationModelsStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(
  profile: OrganizationStudioFoundationModelsProfile
): OrganizationStudioFoundationModelsProfile {
  const store = readStudioFoundationModelsStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeStudioFoundationModelsStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncStudioFoundationModelsFromSources(
  organizationId: string
): OrganizationStudioFoundationModelsProfile {
  const profile = upsertProfile(buildOrganizationStudioFoundationModelsProfile(organizationId));
  return profile;
}

export function ensureOrganizationStudioFoundationModelsProfile(organizationId: string): OrganizationStudioFoundationModelsProfile {
  return readFirstEnsure(organizationId, getOrganizationStudioFoundationModelsProfile, syncStudioFoundationModelsFromSources);
}

export function refreshOrganizationStudioFoundationModelsProfile(
  organizationId: string
): OrganizationStudioFoundationModelsProfile {
  return syncStudioFoundationModelsFromSources(organizationId);
}
