import { readFirstEnsure } from '../sync/profile-cache';
import {
  KNOWLEDGE_REGISTRY_STORAGE_KEY,
  LEGACY_DOCUMENTATION_REGISTRY_STORAGE_KEY,
  KNOWLEDGE_REGISTRY_VERSION,
  STUDIO_OS_KNOWLEDGE_REGISTRY_UPDATED,
} from './constants';
import { syncAllDocumentationConsumers } from './auto-sync';
import { buildOrganizationKnowledgeRegistryProfile } from './registry-profile-builder';
import type { KnowledgeRegistryStore, OrganizationKnowledgeRegistryProfile } from './types';

function emptyStore(): KnowledgeRegistryStore {
  return { version: KNOWLEDGE_REGISTRY_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_KNOWLEDGE_REGISTRY_UPDATED));
  }
}

function migrateLegacyStore(): KnowledgeRegistryStore | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const legacy = localStorage.getItem(LEGACY_DOCUMENTATION_REGISTRY_STORAGE_KEY);
    if (!legacy) return null;
    const parsed = JSON.parse(legacy) as KnowledgeRegistryStore;
    writeKnowledgeRegistryStore({ ...emptyStore(), ...parsed, version: KNOWLEDGE_REGISTRY_VERSION });
    return readKnowledgeRegistryStore();
  } catch {
    return null;
  }
}

export function readKnowledgeRegistryStore(): KnowledgeRegistryStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(KNOWLEDGE_REGISTRY_STORAGE_KEY);
    if (!raw) {
      const migrated = migrateLegacyStore();
      if (migrated) return migrated;
      return emptyStore();
    }
    const parsed = JSON.parse(raw) as KnowledgeRegistryStore;
    return { ...emptyStore(), ...parsed, version: KNOWLEDGE_REGISTRY_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeKnowledgeRegistryStore(store: KnowledgeRegistryStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KNOWLEDGE_REGISTRY_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

/** @deprecated */
export const readDocumentationRegistryStore = readKnowledgeRegistryStore;
/** @deprecated */
export const writeDocumentationRegistryStore = writeKnowledgeRegistryStore;

export function getOrganizationKnowledgeRegistryProfile(
  organizationId: string
): OrganizationKnowledgeRegistryProfile | null {
  return readKnowledgeRegistryStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

/** @deprecated */
export const getOrganizationDocumentationRegistryProfile = getOrganizationKnowledgeRegistryProfile;

function upsertProfile(profile: OrganizationKnowledgeRegistryProfile): OrganizationKnowledgeRegistryProfile {
  const store = readKnowledgeRegistryStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeKnowledgeRegistryStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncKnowledgeRegistryFromSources(organizationId: string): OrganizationKnowledgeRegistryProfile {
  syncAllDocumentationConsumers();
  return upsertProfile(buildOrganizationKnowledgeRegistryProfile(organizationId));
}

/** @deprecated */
export const syncDocumentationRegistryFromSources = syncKnowledgeRegistryFromSources;

export function ensureOrganizationKnowledgeRegistryProfile(organizationId: string): OrganizationKnowledgeRegistryProfile {
  return readFirstEnsure(organizationId, getOrganizationKnowledgeRegistryProfile, syncKnowledgeRegistryFromSources);
}

/** @deprecated */
export const ensureOrganizationDocumentationRegistryProfile = ensureOrganizationKnowledgeRegistryProfile;
