import {
  STUDIO_WORLD_CODEX_STORAGE_KEY,
  STUDIO_WORLD_CODEX_UPDATED_EVENT,
  STUDIO_WORLD_CODEX_VERSION,
} from '../constants';
import { bootstrapCodexStoreIfEmpty, migrateToCanonicalArchive, needsCanonicalArchiveMigration } from '../bootstrap/seeds';
import type { CodexStore } from '../types';

function emptyStore(): CodexStore {
  return {
    version: STUDIO_WORLD_CODEX_VERSION,
    articles: [],
    relationships: [],
    revisionSnapshots: [],
  };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_WORLD_CODEX_UPDATED_EVENT));
  }
}

export function readCodexStore(): CodexStore {
  if (typeof localStorage === 'undefined') {
    return bootstrapCodexStoreIfEmpty(emptyStore());
  }

  try {
    const raw = localStorage.getItem(STUDIO_WORLD_CODEX_STORAGE_KEY);
    if (!raw) {
      const seeded = bootstrapCodexStoreIfEmpty(emptyStore());
      writeCodexStore(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw) as CodexStore;
    const merged: CodexStore = {
      ...emptyStore(),
      ...parsed,
      version: STUDIO_WORLD_CODEX_VERSION,
      articles: parsed.articles ?? [],
      relationships: parsed.relationships ?? [],
      revisionSnapshots: parsed.revisionSnapshots ?? [],
    };

    if (merged.articles.length === 0 || needsCanonicalArchiveMigration(merged)) {
      const migrated = migrateToCanonicalArchive(merged);
      writeCodexStore(migrated);
      return migrated;
    }

    return merged;
  } catch {
    return bootstrapCodexStoreIfEmpty(emptyStore());
  }
}

export function writeCodexStore(store: CodexStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STUDIO_WORLD_CODEX_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function mutateCodexStore(mutator: (store: CodexStore) => CodexStore): CodexStore {
  const next = mutator(readCodexStore());
  writeCodexStore(next);
  return next;
}

/** Future: Supabase adapter replaces localStorage without changing Codex API. */
export type CodexPersistenceAdapter = {
  load: () => Promise<CodexStore>;
  save: (store: CodexStore) => Promise<void>;
};
