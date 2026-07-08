import { readFirstEnsure } from '../sync/profile-cache';
import {
  INNOVATION_CONSTELLATIONS_STORAGE_KEY,
  INNOVATION_CONSTELLATIONS_VERSION,
  STUDIO_OS_INNOVATION_CONSTELLATIONS_UPDATED,
} from './constants';
import { buildOrganizationInnovationConstellationsProfile } from './constellations-builder';
import type {
  ConstellationId,
  GalaxyId,
  InnovationConstellationsStore,
  OrganizationInnovationConstellationsProfile,
} from './types';

function emptyStore(): InnovationConstellationsStore {
  return { version: INNOVATION_CONSTELLATIONS_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_INNOVATION_CONSTELLATIONS_UPDATED));
  }
}

export function readInnovationConstellationsStore(): InnovationConstellationsStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(INNOVATION_CONSTELLATIONS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as InnovationConstellationsStore;
    return { ...emptyStore(), ...parsed, version: INNOVATION_CONSTELLATIONS_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeInnovationConstellationsStore(store: InnovationConstellationsStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(INNOVATION_CONSTELLATIONS_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationInnovationConstellationsProfile(
  organizationId: string
): OrganizationInnovationConstellationsProfile | null {
  return readInnovationConstellationsStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(
  profile: OrganizationInnovationConstellationsProfile
): OrganizationInnovationConstellationsProfile {
  const store = readInnovationConstellationsStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeInnovationConstellationsStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncInnovationConstellationsFromSources(
  organizationId: string
): OrganizationInnovationConstellationsProfile {
  return upsertProfile(buildOrganizationInnovationConstellationsProfile(organizationId));
}

export function ensureOrganizationInnovationConstellationsProfile(
  organizationId: string
): OrganizationInnovationConstellationsProfile {
  return readFirstEnsure(
    organizationId,
    getOrganizationInnovationConstellationsProfile,
    syncInnovationConstellationsFromSources
  );
}

export function setActiveConstellationView(
  organizationId: string,
  galaxyId: GalaxyId,
  constellationId: ConstellationId | null
): OrganizationInnovationConstellationsProfile | null {
  const profile = getOrganizationInnovationConstellationsProfile(organizationId);
  if (!profile) return null;
  return upsertProfile({
    ...profile,
    activeGalaxyId: galaxyId,
    activeConstellationId: constellationId,
    updatedAt: new Date().toISOString(),
  });
}
