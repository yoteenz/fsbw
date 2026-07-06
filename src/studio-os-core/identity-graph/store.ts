import { readFirstEnsure } from '../sync/profile-cache';
import {
  IDENTITY_GRAPH_STORAGE_KEY,
  IDENTITY_GRAPH_VERSION,
  STUDIO_OS_IDENTITY_GRAPH_UPDATED,
} from './constants';
import { buildOrganizationIdentityGraphProfile } from './graph-builder';
import type { IdentityGraphStore, OrganizationIdentityGraphProfile } from './types';

function emptyStore(): IdentityGraphStore {
  return { version: IDENTITY_GRAPH_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_IDENTITY_GRAPH_UPDATED));
  }
}

export function readIdentityGraphStore(): IdentityGraphStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(IDENTITY_GRAPH_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as IdentityGraphStore;
    return { ...emptyStore(), ...parsed, version: IDENTITY_GRAPH_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeIdentityGraphStore(store: IdentityGraphStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(IDENTITY_GRAPH_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationIdentityGraphProfile(organizationId: string): OrganizationIdentityGraphProfile | null {
  return readIdentityGraphStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationIdentityGraphProfile): OrganizationIdentityGraphProfile {
  const store = readIdentityGraphStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeIdentityGraphStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncIdentityGraphFromSources(organizationId: string): OrganizationIdentityGraphProfile {
  const existing = getOrganizationIdentityGraphProfile(organizationId);
  const built = buildOrganizationIdentityGraphProfile(organizationId);
  return upsertProfile({
    ...built,
    selectedPersonId: existing?.selectedPersonId ?? built.selectedPersonId,
  });
}

export function ensureOrganizationIdentityGraphProfile(organizationId: string): OrganizationIdentityGraphProfile {
  return readFirstEnsure(organizationId, getOrganizationIdentityGraphProfile, syncIdentityGraphFromSources);
}

export function refreshIdentityGraph(organizationId: string): OrganizationIdentityGraphProfile {
  return syncIdentityGraphFromSources(organizationId);
}

function withProfile(
  organizationId: string,
  update: (p: OrganizationIdentityGraphProfile) => OrganizationIdentityGraphProfile
): OrganizationIdentityGraphProfile {
  const profile = ensureOrganizationIdentityGraphProfile(organizationId);
  return upsertProfile(update({ ...profile, updatedAt: new Date().toISOString() }));
}

export function selectIdentityPerson(organizationId: string, personId: string): OrganizationIdentityGraphProfile {
  return withProfile(organizationId, (p) => ({ ...p, selectedPersonId: personId }));
}
