import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { CONSTITUTION_SUBSYSTEM_VERSION } from './constants';
import type { ConstitutionStore } from './types';

export function emptyConstitutionStore(): ConstitutionStore {
  return {
    version: CONSTITUTION_SUBSYSTEM_VERSION,
    articles: [],
    relationships: [],
    amendments: [],
    reviews: [],
    votes: [],
    historicalArchive: [],
  };
}

export function readConstitutionStore(): ConstitutionStore {
  const genesis = readGenesisStore();
  return genesis.constitution ?? emptyConstitutionStore();
}

export function writeConstitutionStore(constitution: ConstitutionStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    constitution: {
      ...emptyConstitutionStore(),
      ...constitution,
      version: CONSTITUTION_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateConstitutionStore(
  mutator: (store: ConstitutionStore) => ConstitutionStore
): ConstitutionStore {
  const current = readConstitutionStore();
  const next = mutator(current);
  writeConstitutionStore(next);
  return next;
}

export function ensureConstitutionStore(): ConstitutionStore {
  const store = readConstitutionStore();
  if (!store.bootstrappedAt) {
    const seeded = {
      ...store,
      bootstrappedAt: new Date().toISOString(),
    };
    writeConstitutionStore(seeded);
    return seeded;
  }
  return store;
}
