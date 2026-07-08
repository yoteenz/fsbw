import {
  INSTITUTE_OF_KNOWLEDGE_STORAGE_KEY,
  INSTITUTE_OF_KNOWLEDGE_UPDATED_EVENT,
  INSTITUTE_OF_KNOWLEDGE_VERSION,
} from '../constants';
import { bootstrapInstituteStoreIfEmpty, syncInstituteFromCodex } from '../bootstrap/seeds';
import type { InstituteStore } from '../types';

function emptyStore(): InstituteStore {
  return {
    version: INSTITUTE_OF_KNOWLEDGE_VERSION,
    publications: [],
    relationships: [],
    submissions: [],
    chronicle: [],
  };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(INSTITUTE_OF_KNOWLEDGE_UPDATED_EVENT));
  }
}

export function readInstituteStore(): InstituteStore {
  if (typeof localStorage === 'undefined') {
    return bootstrapInstituteStoreIfEmpty(emptyStore());
  }

  try {
    const raw = localStorage.getItem(INSTITUTE_OF_KNOWLEDGE_STORAGE_KEY);
    if (!raw) {
      const seeded = bootstrapInstituteStoreIfEmpty(emptyStore());
      writeInstituteStore(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw) as InstituteStore;
    const merged: InstituteStore = {
      ...emptyStore(),
      ...parsed,
      version: INSTITUTE_OF_KNOWLEDGE_VERSION,
      publications: parsed.publications ?? [],
      relationships: parsed.relationships ?? [],
      submissions: parsed.submissions ?? [],
      chronicle: parsed.chronicle ?? [],
    };

    if (merged.publications.length === 0) {
      const seeded = bootstrapInstituteStoreIfEmpty(merged);
      writeInstituteStore(seeded);
      return seeded;
    }

    const synced = syncInstituteFromCodex(merged);
    if (synced !== merged) {
      writeInstituteStore(synced);
      return synced;
    }

    return merged;
  } catch {
    return bootstrapInstituteStoreIfEmpty(emptyStore());
  }
}

export function writeInstituteStore(store: InstituteStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(INSTITUTE_OF_KNOWLEDGE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function mutateInstituteStore(
  mutator: (store: InstituteStore) => InstituteStore
): InstituteStore {
  const next = mutator(readInstituteStore());
  writeInstituteStore(next);
  return next;
}

/** Future: Supabase adapter replaces localStorage without changing Institute API. */
export type InstitutePersistenceAdapter = {
  load: () => Promise<InstituteStore>;
  save: (store: InstituteStore) => Promise<void>;
};
