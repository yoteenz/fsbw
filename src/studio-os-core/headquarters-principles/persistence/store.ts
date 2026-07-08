import {
  HEADQUARTERS_PRINCIPLES_STORAGE_KEY,
  HEADQUARTERS_PRINCIPLES_UPDATED_EVENT,
  HEADQUARTERS_PRINCIPLES_VERSION,
} from '../constants';
import { bootstrapHeadquartersPrinciplesStore } from '../bootstrap/seeds';
import type { HeadquartersPrinciplesStore } from '../types';

function emptyStore(): HeadquartersPrinciplesStore {
  return {
    version: HEADQUARTERS_PRINCIPLES_VERSION,
    subsystems: [],
  };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(HEADQUARTERS_PRINCIPLES_UPDATED_EVENT));
  }
}

export function readHeadquartersPrinciplesStore(): HeadquartersPrinciplesStore {
  if (typeof localStorage === 'undefined') {
    return bootstrapHeadquartersPrinciplesStore();
  }

  try {
    const raw = localStorage.getItem(HEADQUARTERS_PRINCIPLES_STORAGE_KEY);
    if (!raw) {
      const seeded = bootstrapHeadquartersPrinciplesStore();
      writeHeadquartersPrinciplesStore(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw) as HeadquartersPrinciplesStore;
    if (!parsed.subsystems?.length || parsed.version !== HEADQUARTERS_PRINCIPLES_VERSION) {
      const seeded = bootstrapHeadquartersPrinciplesStore();
      writeHeadquartersPrinciplesStore(seeded);
      return seeded;
    }

    return {
      ...emptyStore(),
      ...parsed,
      version: HEADQUARTERS_PRINCIPLES_VERSION,
      subsystems: parsed.subsystems ?? [],
    };
  } catch {
    return bootstrapHeadquartersPrinciplesStore();
  }
}

export function writeHeadquartersPrinciplesStore(store: HeadquartersPrinciplesStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(HEADQUARTERS_PRINCIPLES_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function mutateHeadquartersPrinciplesStore(
  mutator: (store: HeadquartersPrinciplesStore) => HeadquartersPrinciplesStore
): HeadquartersPrinciplesStore {
  const next = mutator(readHeadquartersPrinciplesStore());
  writeHeadquartersPrinciplesStore(next);
  return next;
}
