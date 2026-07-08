import {
  KNOWLEDGE_CORE_STORAGE_KEY,
  KNOWLEDGE_CORE_VERSION,
  STUDIO_OS_KNOWLEDGE_CORE_UPDATED,
} from './constants';
import type { KnowledgeCoreEntry, KnowledgeCoreStore } from './types';

function emptyStore(): KnowledgeCoreStore {
  return { version: KNOWLEDGE_CORE_VERSION, profiles: [], ingestedEntries: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_KNOWLEDGE_CORE_UPDATED));
  }
}

export function readKnowledgeCoreStore(): KnowledgeCoreStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(KNOWLEDGE_CORE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as KnowledgeCoreStore;
    return { ...emptyStore(), ...parsed, version: KNOWLEDGE_CORE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeKnowledgeCoreStore(store: KnowledgeCoreStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KNOWLEDGE_CORE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function writeIngestedEntry(entry: KnowledgeCoreEntry): void {
  const store = readKnowledgeCoreStore();
  const next = store.ingestedEntries.filter((e) => e.id !== entry.id);
  writeKnowledgeCoreStore({
    ...store,
    ingestedEntries: [...next, entry],
  });
}

export function upsertKnowledgeCoreProfile(
  profile: KnowledgeCoreStore['profiles'][number]
): KnowledgeCoreStore['profiles'][number] {
  const store = readKnowledgeCoreStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeKnowledgeCoreStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function getOrganizationKnowledgeCoreProfile(
  organizationId: string
): KnowledgeCoreStore['profiles'][number] | null {
  return readKnowledgeCoreStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}
