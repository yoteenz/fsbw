import {
  DOCUMENTATION_REGISTRY_STORAGE_KEY,
  DOCUMENTATION_REGISTRY_VERSION,
  STUDIO_OS_DOCUMENTATION_REGISTRY_UPDATED,
} from './constants';
import { syncAllDocumentationConsumers } from './auto-sync';
import { buildOrganizationDocumentationRegistryProfile } from './registry-profile-builder';
import type { DocumentationRegistryStore, OrganizationDocumentationRegistryProfile } from './types';

function emptyStore(): DocumentationRegistryStore {
  return { version: DOCUMENTATION_REGISTRY_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_DOCUMENTATION_REGISTRY_UPDATED));
  }
}

export function readDocumentationRegistryStore(): DocumentationRegistryStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(DOCUMENTATION_REGISTRY_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as DocumentationRegistryStore;
    return { ...emptyStore(), ...parsed, version: DOCUMENTATION_REGISTRY_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeDocumentationRegistryStore(store: DocumentationRegistryStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DOCUMENTATION_REGISTRY_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationDocumentationRegistryProfile(
  organizationId: string
): OrganizationDocumentationRegistryProfile | null {
  return readDocumentationRegistryStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationDocumentationRegistryProfile): OrganizationDocumentationRegistryProfile {
  const store = readDocumentationRegistryStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeDocumentationRegistryStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild registry profile and refresh all documentation consumers */
export function syncDocumentationRegistryFromSources(
  organizationId: string
): OrganizationDocumentationRegistryProfile {
  syncAllDocumentationConsumers();
  const profile = upsertProfile(buildOrganizationDocumentationRegistryProfile(organizationId));
  void import('../documentation-governance/store').then((m) => {
    m.syncDocumentationGovernanceFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationDocumentationRegistryProfile(
  organizationId: string
): OrganizationDocumentationRegistryProfile {
  return syncDocumentationRegistryFromSources(organizationId);
}
