import { readFirstEnsure } from '../sync/profile-cache';
import {
  EXPERIENCE_ENGINE_STORAGE_KEY,
  EXPERIENCE_ENGINE_VERSION,
  STUDIO_OS_EXPERIENCE_ENGINE_UPDATED,
} from './constants';
import { buildAdaptiveEnvironmentSettings } from './environment-engine';
import { buildOrganizationExperienceEngineProfile } from './engine-profile-builder';
import type { OrganizationExperienceEngineProfile, ExperienceEngineStore } from './types';

function emptyStore(): ExperienceEngineStore {
  return { version: EXPERIENCE_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_EXPERIENCE_ENGINE_UPDATED));
  }
}

export function readExperienceEngineStore(): ExperienceEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(EXPERIENCE_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ExperienceEngineStore;
    return { ...emptyStore(), ...parsed, version: EXPERIENCE_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeExperienceEngineStore(store: ExperienceEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(EXPERIENCE_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationExperienceEngineProfile(
  organizationId: string
): OrganizationExperienceEngineProfile | null {
  return readExperienceEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationExperienceEngineProfile): OrganizationExperienceEngineProfile {
  const store = readExperienceEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeExperienceEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild experience modes, environment, context, and transitions from Asset Registry + platform sources */
export function syncExperienceEngineFromSources(organizationId: string): OrganizationExperienceEngineProfile {
  return upsertProfile(buildOrganizationExperienceEngineProfile(organizationId));
}

export function ensureOrganizationExperienceEngineProfile(organizationId: string): OrganizationExperienceEngineProfile {
  return readFirstEnsure(organizationId, getOrganizationExperienceEngineProfile, syncExperienceEngineFromSources);
}

export function setExperienceMode(
  organizationId: string,
  modeId: OrganizationExperienceEngineProfile['activeMode']
): OrganizationExperienceEngineProfile {
  const profile =
    getOrganizationExperienceEngineProfile(organizationId) ?? syncExperienceEngineFromSources(organizationId);
  const modeEntry = profile.experienceModes.find((m) => m.modeId === modeId);
  return upsertProfile({
    ...profile,
    activeMode: modeId,
    activeModeLabel: modeEntry?.label ?? modeId,
    environmentSettings: buildAdaptiveEnvironmentSettings(modeId),
    updatedAt: new Date().toISOString(),
  });
}
