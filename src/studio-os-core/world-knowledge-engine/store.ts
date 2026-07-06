import {
  STUDIO_OS_WORLD_KNOWLEDGE_ENGINE_UPDATED,
  WORLD_KNOWLEDGE_ENGINE_STORAGE_KEY,
  WORLD_KNOWLEDGE_ENGINE_VERSION,
} from './constants';
import { buildOrganizationWorldKnowledgeProfile } from './knowledge-builder';
import type { OrganizationWorldKnowledgeProfile, WorldKnowledgeEngineStore } from './types';

function emptyStore(): WorldKnowledgeEngineStore {
  return { version: WORLD_KNOWLEDGE_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_WORLD_KNOWLEDGE_ENGINE_UPDATED));
  }
}

export function readWorldKnowledgeEngineStore(): WorldKnowledgeEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(WORLD_KNOWLEDGE_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as WorldKnowledgeEngineStore;
    return { ...emptyStore(), ...parsed, version: WORLD_KNOWLEDGE_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeWorldKnowledgeEngineStore(store: WorldKnowledgeEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(WORLD_KNOWLEDGE_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationWorldKnowledgeProfile(
  organizationId: string
): OrganizationWorldKnowledgeProfile | null {
  return readWorldKnowledgeEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationWorldKnowledgeProfile): OrganizationWorldKnowledgeProfile {
  const store = readWorldKnowledgeEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeWorldKnowledgeEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncWorldKnowledgeEngineFromSources(
  organizationId: string
): OrganizationWorldKnowledgeProfile {
  return upsertProfile(buildOrganizationWorldKnowledgeProfile(organizationId));
}

export function ensureOrganizationWorldKnowledgeProfile(
  organizationId: string
): OrganizationWorldKnowledgeProfile {
  return syncWorldKnowledgeEngineFromSources(organizationId);
}

export function refreshOrganizationWorldKnowledgeProfile(
  organizationId: string
): OrganizationWorldKnowledgeProfile {
  return syncWorldKnowledgeEngineFromSources(organizationId);
}
