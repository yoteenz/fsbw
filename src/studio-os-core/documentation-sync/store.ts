import { readFirstEnsure } from '../sync/profile-cache';
import {
  DOCUMENTATION_SYNC_STORAGE_KEY,
  DOCUMENTATION_SYNC_VERSION,
  STUDIO_OS_DOCUMENTATION_SYNC_UPDATED,
} from './constants';
import { buildOrganizationDocumentationSyncProfile, invalidateDocumentationCaches } from './sync-engine';
import type { DocumentationSyncStore, OrganizationDocumentationSyncProfile } from './types';

export { buildRegistrySearchEntries } from './search-entries';

function emptyStore(): DocumentationSyncStore {
  return { version: DOCUMENTATION_SYNC_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_DOCUMENTATION_SYNC_UPDATED));
  }
}

export function readDocumentationSyncStore(): DocumentationSyncStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(DOCUMENTATION_SYNC_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as DocumentationSyncStore;
    return { ...emptyStore(), ...parsed, version: DOCUMENTATION_SYNC_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeDocumentationSyncStore(store: DocumentationSyncStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DOCUMENTATION_SYNC_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationDocumentationSyncProfile(
  organizationId: string
): OrganizationDocumentationSyncProfile | null {
  return readDocumentationSyncStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationDocumentationSyncProfile): OrganizationDocumentationSyncProfile {
  const store = readDocumentationSyncStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeDocumentationSyncStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild all documentation surfaces from canonical registry */
export function syncDocumentationFromSources(organizationId: string): OrganizationDocumentationSyncProfile {
  invalidateDocumentationCaches();
  const profile = upsertProfile(buildOrganizationDocumentationSyncProfile(organizationId));
  return profile;
}

export function ensureOrganizationDocumentationSyncProfile(organizationId: string): OrganizationDocumentationSyncProfile {
  return readFirstEnsure(organizationId, getOrganizationDocumentationSyncProfile, syncDocumentationFromSources);
}
