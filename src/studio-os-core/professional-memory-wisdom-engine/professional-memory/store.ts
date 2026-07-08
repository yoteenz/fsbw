import {
  PROFESSIONAL_MEMORY_STORAGE_KEY,
  PROFESSIONAL_MEMORY_UPDATED_EVENT,
  PROFESSIONAL_MEMORY_WISDOM_ENGINE_VERSION,
} from '../constants';
import { LAUNCH_PROFESSIONAL_MEMORIES } from '../memory-events/catalog';
import { mergeWithLaunchMemories } from '../memory-events/registry';
import { achievementsFromMemories } from '../achievement-history/store';
import { careerHistoryFromMemories } from '../career-history/aggregator';
import type { ProfessionalMemoryRecord, ProfessionalMemoryStore } from '../types';

function emptyStore(
  organizationId: string,
  learnerId: string,
  profession = 'all'
): ProfessionalMemoryStore {
  const now = new Date().toISOString();
  const memories = LAUNCH_PROFESSIONAL_MEMORIES;
  return {
    version: PROFESSIONAL_MEMORY_WISDOM_ENGINE_VERSION,
    organizationId,
    learnerId,
    profession,
    memories,
    careerHistory: careerHistoryFromMemories(memories),
    achievements: achievementsFromMemories(memories),
    orbSurfacedMemoryIds: [],
    updatedAt: now,
  };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROFESSIONAL_MEMORY_UPDATED_EVENT));
  }
}

export function professionalMemoryStoreKey(organizationId: string, learnerId: string): string {
  return `${organizationId}:${learnerId}`;
}

export function readProfessionalMemoryStores(): ProfessionalMemoryStore[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROFESSIONAL_MEMORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProfessionalMemoryStore[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeProfessionalMemoryStores(stores: ProfessionalMemoryStore[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PROFESSIONAL_MEMORY_STORAGE_KEY, JSON.stringify(stores));
  dispatchUpdated();
}

export function getProfessionalMemoryStore(
  organizationId: string,
  learnerId: string
): ProfessionalMemoryStore | null {
  const key = professionalMemoryStoreKey(organizationId, learnerId);
  return (
    readProfessionalMemoryStores().find(
      (store) => professionalMemoryStoreKey(store.organizationId, store.learnerId) === key
    ) ?? null
  );
}

export function ensureProfessionalMemoryStore(
  organizationId: string,
  learnerId: string,
  profession = 'all'
): ProfessionalMemoryStore {
  const existing = getProfessionalMemoryStore(organizationId, learnerId);
  if (existing) {
    const memories = mergeWithLaunchMemories(existing.memories);
    return {
      ...existing,
      version: PROFESSIONAL_MEMORY_WISDOM_ENGINE_VERSION,
      memories,
      careerHistory: existing.careerHistory.length
        ? existing.careerHistory
        : careerHistoryFromMemories(memories),
      achievements: existing.achievements.length
        ? existing.achievements
        : achievementsFromMemories(memories),
    };
  }

  const store = emptyStore(organizationId, learnerId, profession);
  writeProfessionalMemoryStores([...readProfessionalMemoryStores(), store]);
  return store;
}

export function upsertProfessionalMemoryStore(store: ProfessionalMemoryStore): ProfessionalMemoryStore {
  const memories = mergeWithLaunchMemories(store.memories);
  const next: ProfessionalMemoryStore = {
    ...store,
    version: PROFESSIONAL_MEMORY_WISDOM_ENGINE_VERSION,
    memories,
    careerHistory: store.careerHistory.length
      ? store.careerHistory
      : careerHistoryFromMemories(memories),
    achievements: store.achievements.length
      ? store.achievements
      : achievementsFromMemories(memories),
    updatedAt: new Date().toISOString(),
  };
  const key = professionalMemoryStoreKey(next.organizationId, next.learnerId);
  const stores = readProfessionalMemoryStores().filter(
    (item) => professionalMemoryStoreKey(item.organizationId, item.learnerId) !== key
  );
  writeProfessionalMemoryStores([...stores, next]);
  return next;
}

export function appendProfessionalMemory(
  organizationId: string,
  learnerId: string,
  memory: ProfessionalMemoryRecord
): ProfessionalMemoryStore {
  const store = ensureProfessionalMemoryStore(organizationId, learnerId);
  const memories = mergeWithLaunchMemories([...store.memories, memory]);
  return upsertProfessionalMemoryStore({
    ...store,
    memories,
    careerHistory: careerHistoryFromMemories(memories),
    achievements: achievementsFromMemories(memories),
  });
}

export type ProfessionalMemoryPersistenceAdapter = {
  load: (organizationId: string, learnerId: string) => Promise<ProfessionalMemoryStore | null>;
  save: (store: ProfessionalMemoryStore) => Promise<void>;
};
