import { readFirstEnsure } from '../sync/profile-cache';
import {
  ORGANIZATIONAL_HIERARCHY_STORAGE_KEY,
  ORGANIZATIONAL_HIERARCHY_VERSION,
  STUDIO_OS_ORGANIZATIONAL_HIERARCHY_UPDATED,
} from './constants';
import { buildOrganizationHierarchyProfile } from './hierarchy-builder';
import type { OrganizationHierarchyProfile, OrganizationalHierarchyStore } from './types';

function emptyStore(): OrganizationalHierarchyStore {
  return { version: ORGANIZATIONAL_HIERARCHY_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_ORGANIZATIONAL_HIERARCHY_UPDATED));
  }
}

export function readOrganizationalHierarchyStore(): OrganizationalHierarchyStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATIONAL_HIERARCHY_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationalHierarchyStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATIONAL_HIERARCHY_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationalHierarchyStore(store: OrganizationalHierarchyStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ORGANIZATIONAL_HIERARCHY_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationHierarchyProfile(organizationId: string): OrganizationHierarchyProfile | null {
  return readOrganizationalHierarchyStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationHierarchyProfile): OrganizationHierarchyProfile {
  const store = readOrganizationalHierarchyStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeOrganizationalHierarchyStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncOrganizationalHierarchyFromSources(organizationId: string): OrganizationHierarchyProfile {
  const existing = getOrganizationHierarchyProfile(organizationId);
  const built = buildOrganizationHierarchyProfile(organizationId);
  return upsertProfile({
    ...built,
    selectedNodeId: existing?.selectedNodeId ?? built.selectedNodeId,
  });
}

export function ensureOrganizationHierarchyProfile(organizationId: string): OrganizationHierarchyProfile {
  return readFirstEnsure(organizationId, getOrganizationHierarchyProfile, syncOrganizationalHierarchyFromSources);
}

export function refreshOrganizationalHierarchy(organizationId: string): OrganizationHierarchyProfile {
  return syncOrganizationalHierarchyFromSources(organizationId);
}

function withProfile(
  organizationId: string,
  update: (p: OrganizationHierarchyProfile) => OrganizationHierarchyProfile
): OrganizationHierarchyProfile {
  const profile = ensureOrganizationHierarchyProfile(organizationId);
  return upsertProfile(update({ ...profile, updatedAt: new Date().toISOString() }));
}

export function selectHierarchyNode(organizationId: string, nodeId: string): OrganizationHierarchyProfile {
  return withProfile(organizationId, (p) => ({ ...p, selectedNodeId: nodeId }));
}
