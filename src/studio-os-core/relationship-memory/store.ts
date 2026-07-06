import { readFirstEnsure } from '../sync/profile-cache';
import {
  RELATIONSHIP_MEMORY_STORAGE_KEY,
  RELATIONSHIP_MEMORY_VERSION,
  STUDIO_OS_RELATIONSHIP_MEMORY_UPDATED,
} from './constants';
import { buildOrganizationRelationshipMemoryProfile } from './memory-builder';
import type { OrganizationRelationshipMemoryProfile, RelationshipMemoryStore } from './types';

function emptyStore(): RelationshipMemoryStore {
  return { version: RELATIONSHIP_MEMORY_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_RELATIONSHIP_MEMORY_UPDATED));
  }
}

export function readRelationshipMemoryStore(): RelationshipMemoryStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(RELATIONSHIP_MEMORY_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as RelationshipMemoryStore;
    return { ...emptyStore(), ...parsed, version: RELATIONSHIP_MEMORY_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeRelationshipMemoryStore(store: RelationshipMemoryStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(RELATIONSHIP_MEMORY_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationRelationshipMemoryProfile(
  organizationId: string
): OrganizationRelationshipMemoryProfile | null {
  return readRelationshipMemoryStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationRelationshipMemoryProfile): OrganizationRelationshipMemoryProfile {
  const store = readRelationshipMemoryStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeRelationshipMemoryStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncRelationshipMemoryFromSources(
  organizationId: string
): OrganizationRelationshipMemoryProfile {
  const profile = upsertProfile(buildOrganizationRelationshipMemoryProfile(organizationId));
  return profile;
}

export function ensureOrganizationRelationshipMemoryProfile(organizationId: string): OrganizationRelationshipMemoryProfile {
  return readFirstEnsure(organizationId, getOrganizationRelationshipMemoryProfile, syncRelationshipMemoryFromSources);
}

export function refreshRelationshipMemoryProfile(
  organizationId: string
): OrganizationRelationshipMemoryProfile {
  return syncRelationshipMemoryFromSources(organizationId);
}
