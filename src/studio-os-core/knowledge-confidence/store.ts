import { readFirstEnsure } from '../sync/profile-cache';
import {
  KNOWLEDGE_CONFIDENCE_STORAGE_KEY,
  KNOWLEDGE_CONFIDENCE_VERSION,
  STUDIO_OS_KNOWLEDGE_CONFIDENCE_UPDATED,
} from './constants';
import { buildOrganizationKnowledgeConfidenceProfile } from './confidence-builder';
import type { KnowledgeConfidenceStore, OrganizationKnowledgeConfidenceProfile } from './types';

function emptyStore(): KnowledgeConfidenceStore {
  return { version: KNOWLEDGE_CONFIDENCE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_KNOWLEDGE_CONFIDENCE_UPDATED));
  }
}

export function readKnowledgeConfidenceStore(): KnowledgeConfidenceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(KNOWLEDGE_CONFIDENCE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as KnowledgeConfidenceStore;
    return { ...emptyStore(), ...parsed, version: KNOWLEDGE_CONFIDENCE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeKnowledgeConfidenceStore(store: KnowledgeConfidenceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KNOWLEDGE_CONFIDENCE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationKnowledgeConfidenceProfile(
  organizationId: string
): OrganizationKnowledgeConfidenceProfile | null {
  return readKnowledgeConfidenceStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationKnowledgeConfidenceProfile): OrganizationKnowledgeConfidenceProfile {
  const store = readKnowledgeConfidenceStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeKnowledgeConfidenceStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncKnowledgeConfidenceFromSources(organizationId: string): OrganizationKnowledgeConfidenceProfile {
  const profile = buildOrganizationKnowledgeConfidenceProfile(organizationId);
  return upsertProfile(profile);
}

export function ensureOrganizationKnowledgeConfidenceProfile(organizationId: string): OrganizationKnowledgeConfidenceProfile {
  return readFirstEnsure(organizationId, getOrganizationKnowledgeConfidenceProfile, syncKnowledgeConfidenceFromSources);
}

export function getBrainConfidenceScore(organizationId: string, brainId: string) {
  const profile = getOrganizationKnowledgeConfidenceProfile(organizationId) ?? syncKnowledgeConfidenceFromSources(organizationId);
  return profile.brainProfiles.find((b) => b.brainId === brainId) ?? null;
}
