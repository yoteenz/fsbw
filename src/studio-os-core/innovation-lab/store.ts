import {
  INNOVATION_LAB_STORAGE_KEY,
  INNOVATION_LAB_VERSION,
  STUDIO_OS_INNOVATION_LAB_UPDATED,
} from './constants';
import { buildOrganizationInnovationLabProfile } from './innovation-lab-builder';
import type { InnovationLabStore, OrganizationInnovationLabProfile } from './types';

function emptyStore(): InnovationLabStore {
  return { version: INNOVATION_LAB_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_INNOVATION_LAB_UPDATED));
  }
}

export function readInnovationLabStore(): InnovationLabStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(INNOVATION_LAB_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as InnovationLabStore;
    return { ...emptyStore(), ...parsed, version: INNOVATION_LAB_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeInnovationLabStore(store: InnovationLabStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(INNOVATION_LAB_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationInnovationLabProfile(
  organizationId: string
): OrganizationInnovationLabProfile | null {
  return readInnovationLabStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationInnovationLabProfile): OrganizationInnovationLabProfile {
  const store = readInnovationLabStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeInnovationLabStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncInnovationLabFromSources(organizationId: string): OrganizationInnovationLabProfile {
  return upsertProfile(buildOrganizationInnovationLabProfile(organizationId));
}

export function ensureOrganizationInnovationLabProfile(
  organizationId: string
): OrganizationInnovationLabProfile {
  return syncInnovationLabFromSources(organizationId);
}

export function refreshOrganizationInnovationLabProfile(
  organizationId: string
): OrganizationInnovationLabProfile {
  return syncInnovationLabFromSources(organizationId);
}
