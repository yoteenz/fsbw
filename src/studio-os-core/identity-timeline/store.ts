import { readFirstEnsure } from '../sync/profile-cache';
import {
  IDENTITY_TIMELINE_STORAGE_KEY,
  IDENTITY_TIMELINE_VERSION,
  STUDIO_OS_IDENTITY_TIMELINE_UPDATED,
} from './constants';
import { buildOrganizationIdentityTimelineProfile } from './timeline-builder';
import type { IdentityTimelineStore, OrganizationIdentityTimelineProfile } from './types';

function emptyStore(): IdentityTimelineStore {
  return { version: IDENTITY_TIMELINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_IDENTITY_TIMELINE_UPDATED));
  }
}

export function readIdentityTimelineStore(): IdentityTimelineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(IDENTITY_TIMELINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as IdentityTimelineStore;
    return { ...emptyStore(), ...parsed, version: IDENTITY_TIMELINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeIdentityTimelineStore(store: IdentityTimelineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(IDENTITY_TIMELINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationIdentityTimelineProfile(organizationId: string): OrganizationIdentityTimelineProfile | null {
  return readIdentityTimelineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationIdentityTimelineProfile): OrganizationIdentityTimelineProfile {
  const store = readIdentityTimelineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeIdentityTimelineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncIdentityTimelineFromSources(organizationId: string): OrganizationIdentityTimelineProfile {
  const existing = getOrganizationIdentityTimelineProfile(organizationId);
  const built = buildOrganizationIdentityTimelineProfile(organizationId);
  return upsertProfile({
    ...built,
    selectedPersonId: existing?.selectedPersonId ?? built.selectedPersonId,
  });
}

export function ensureOrganizationIdentityTimelineProfile(organizationId: string): OrganizationIdentityTimelineProfile {
  return readFirstEnsure(organizationId, getOrganizationIdentityTimelineProfile, syncIdentityTimelineFromSources);
}

export function refreshIdentityTimeline(organizationId: string): OrganizationIdentityTimelineProfile {
  return syncIdentityTimelineFromSources(organizationId);
}

function withProfile(
  organizationId: string,
  update: (p: OrganizationIdentityTimelineProfile) => OrganizationIdentityTimelineProfile
): OrganizationIdentityTimelineProfile {
  const profile = ensureOrganizationIdentityTimelineProfile(organizationId);
  return upsertProfile(update({ ...profile, updatedAt: new Date().toISOString() }));
}

export function selectTimelinePerson(organizationId: string, personId: string): OrganizationIdentityTimelineProfile {
  return withProfile(organizationId, (p) => ({ ...p, selectedPersonId: personId }));
}
