import {
  DOCUMENTATION_GOVERNANCE_STORAGE_KEY,
  DOCUMENTATION_GOVERNANCE_VERSION,
  STUDIO_OS_DOCUMENTATION_GOVERNANCE_UPDATED,
} from './constants';
import { buildOrganizationDocumentationGovernanceProfile } from './governance-profile-builder';
import type { DocumentationGovernanceStore, OrganizationDocumentationGovernanceProfile } from './types';

function emptyStore(): DocumentationGovernanceStore {
  return { version: DOCUMENTATION_GOVERNANCE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_DOCUMENTATION_GOVERNANCE_UPDATED));
  }
}

export function readDocumentationGovernanceStore(): DocumentationGovernanceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(DOCUMENTATION_GOVERNANCE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as DocumentationGovernanceStore;
    return { ...emptyStore(), ...parsed, version: DOCUMENTATION_GOVERNANCE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeDocumentationGovernanceStore(store: DocumentationGovernanceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DOCUMENTATION_GOVERNANCE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationDocumentationGovernanceProfile(
  organizationId: string
): OrganizationDocumentationGovernanceProfile | null {
  return readDocumentationGovernanceStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationDocumentationGovernanceProfile): OrganizationDocumentationGovernanceProfile {
  const store = readDocumentationGovernanceStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeDocumentationGovernanceStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild governance profile from Documentation Registry™ and run continuous audits */
export function syncDocumentationGovernanceFromSources(
  organizationId: string
): OrganizationDocumentationGovernanceProfile {
  const profile = upsertProfile(buildOrganizationDocumentationGovernanceProfile(organizationId));
  void import('../system-registry/store').then((m) => {
    m.syncSystemRegistryFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationDocumentationGovernanceProfile(
  organizationId: string
): OrganizationDocumentationGovernanceProfile {
  return syncDocumentationGovernanceFromSources(organizationId);
}
