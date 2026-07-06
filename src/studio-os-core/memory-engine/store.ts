import {
  MEMORY_ENGINE_STORAGE_KEY,
  MEMORY_ENGINE_VERSION,
  STUDIO_OS_MEMORY_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationMemoryProfile } from './memory-builder';
import { recallOrganizationalMemory } from './recall-engine';
import type { MemoryRecallResult, OrganizationMemoryProfile, MemoryEngineStore } from './types';

function emptyStore(): MemoryEngineStore {
  return { version: MEMORY_ENGINE_VERSION, profiles: [] };
}

export function readMemoryEngineStore(): MemoryEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(MEMORY_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as MemoryEngineStore;
    return { ...emptyStore(), ...parsed, version: MEMORY_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeMemoryEngineStore(store: MemoryEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(MEMORY_ENGINE_STORAGE_KEY, JSON.stringify(store));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_MEMORY_ENGINE_UPDATED));
  }
}

export function getOrganizationMemoryProfile(organizationId: string): OrganizationMemoryProfile | null {
  return readMemoryEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

export function syncMemoryEngineFromSources(organizationId: string): OrganizationMemoryProfile {
  const profile = buildOrganizationMemoryProfile(organizationId);
  const store = readMemoryEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== organizationId);
  writeMemoryEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function ensureOrganizationMemoryProfile(organizationId: string): OrganizationMemoryProfile {
  const existing = getOrganizationMemoryProfile(organizationId);
  if (existing) return existing;
  return syncMemoryEngineFromSources(organizationId);
}

export function recallMemoryForQuery(organizationId: string, query: string): MemoryRecallResult {
  const profile = getOrganizationMemoryProfile(organizationId) ?? syncMemoryEngineFromSources(organizationId);
  return recallOrganizationalMemory(query, profile.records, profile.projectArtifacts);
}

export { recallOrganizationalMemory };
