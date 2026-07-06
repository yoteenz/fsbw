import { readFirstEnsure } from '../sync/profile-cache';
import {
  PROMPT_REGISTRY_STORAGE_KEY,
  PROMPT_REGISTRY_VERSION,
  STUDIO_OS_PROMPT_REGISTRY_UPDATED,
} from './constants';
import { buildOrganizationPromptRegistryProfile } from './engine-profile-builder';
import type { OrganizationPromptRegistryProfile, PromptRegistryStore, PromptTestResult } from './types';

function emptyStore(): PromptRegistryStore {
  return { version: PROMPT_REGISTRY_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_PROMPT_REGISTRY_UPDATED));
  }
}

export function readPromptRegistryStore(): PromptRegistryStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(PROMPT_REGISTRY_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as PromptRegistryStore;
    return { ...emptyStore(), ...parsed, version: PROMPT_REGISTRY_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writePromptRegistryStore(store: PromptRegistryStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PROMPT_REGISTRY_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationPromptRegistryProfile(
  organizationId: string
): OrganizationPromptRegistryProfile | null {
  return readPromptRegistryStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationPromptRegistryProfile): OrganizationPromptRegistryProfile {
  const store = readPromptRegistryStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writePromptRegistryStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild prompt catalog, version history, and testing from Automation Registry + platform sources */
export function syncPromptRegistryFromSources(organizationId: string): OrganizationPromptRegistryProfile {
  const existing = getOrganizationPromptRegistryProfile(organizationId);
  const rebuilt = buildOrganizationPromptRegistryProfile(organizationId);
  if (existing?.versionHistory?.length) {
    rebuilt.versionHistory = existing.versionHistory;
  }
  if (existing?.testResults?.length) {
    rebuilt.testResults = existing.testResults;
  }
  const profile = upsertProfile(rebuilt);
  return profile;
}

export function ensureOrganizationPromptRegistryProfile(organizationId: string): OrganizationPromptRegistryProfile {
  return readFirstEnsure(organizationId, getOrganizationPromptRegistryProfile, syncPromptRegistryFromSources);
}

export function appendPromptTestResult(
  organizationId: string,
  result: PromptTestResult
): OrganizationPromptRegistryProfile {
  const profile =
    getOrganizationPromptRegistryProfile(organizationId) ?? syncPromptRegistryFromSources(organizationId);
  return upsertProfile({
    ...profile,
    testResults: [result, ...profile.testResults].slice(0, 80),
    updatedAt: new Date().toISOString(),
  });
}
