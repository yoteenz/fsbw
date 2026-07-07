import { readFirstEnsure } from '../sync/profile-cache';
import {
  PROFESSIONAL_PROFILE_STORAGE_KEY,
  PROFESSIONAL_PROFILE_VERSION,
  STUDIO_OS_PROFESSIONAL_PROFILE_UPDATED,
} from './constants';
import { buildOrganizationProfessionalProfilesProfile } from './profile-builder';
import type { OrganizationProfessionalProfilesProfile, ProfessionalProfileStore } from './types';

function emptyStore(): ProfessionalProfileStore {
  return { version: PROFESSIONAL_PROFILE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_PROFESSIONAL_PROFILE_UPDATED));
  }
}

export function readProfessionalProfileStore(): ProfessionalProfileStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(PROFESSIONAL_PROFILE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ProfessionalProfileStore;
    return { ...emptyStore(), ...parsed, version: PROFESSIONAL_PROFILE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeProfessionalProfileStore(store: ProfessionalProfileStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PROFESSIONAL_PROFILE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationProfessionalProfilesProfile(
  organizationId: string
): OrganizationProfessionalProfilesProfile | null {
  return readProfessionalProfileStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationProfessionalProfilesProfile): OrganizationProfessionalProfilesProfile {
  const store = readProfessionalProfileStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeProfessionalProfileStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncProfessionalProfileFromSources(
  organizationId: string
): OrganizationProfessionalProfilesProfile {
  const existing = getOrganizationProfessionalProfilesProfile(organizationId);
  const built = buildOrganizationProfessionalProfilesProfile(organizationId);
  return upsertProfile({
    ...built,
    selectedProfileId: existing?.selectedProfileId ?? built.selectedProfileId,
  });
}

export function ensureOrganizationProfessionalProfilesProfile(
  organizationId: string
): OrganizationProfessionalProfilesProfile {
  return readFirstEnsure(organizationId, getOrganizationProfessionalProfilesProfile, syncProfessionalProfileFromSources);
}

export function refreshProfessionalProfile(organizationId: string): OrganizationProfessionalProfilesProfile {
  return syncProfessionalProfileFromSources(organizationId);
}

function withProfile(
  organizationId: string,
  update: (p: OrganizationProfessionalProfilesProfile) => OrganizationProfessionalProfilesProfile
): OrganizationProfessionalProfilesProfile {
  const profile = ensureOrganizationProfessionalProfilesProfile(organizationId);
  return upsertProfile(update({ ...profile, updatedAt: new Date().toISOString() }));
}

export function selectProfessionalProfile(
  organizationId: string,
  profileId: string
): OrganizationProfessionalProfilesProfile {
  return withProfile(organizationId, (p) => ({ ...p, selectedProfileId: profileId }));
}
