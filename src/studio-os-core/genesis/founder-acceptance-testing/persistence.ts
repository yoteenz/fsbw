import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { FAT_SUBSYSTEM_VERSION } from './constants';
import type { FatStore } from './types';

export function emptyFounderAcceptanceTestingStore(): FatStore {
  return {
    version: FAT_SUBSYSTEM_VERSION,
    records: [],
    history: [],
  };
}

export function readFounderAcceptanceTestingStore(): FatStore {
  const genesis = readGenesisStore();
  return genesis.founderAcceptanceTesting ?? emptyFounderAcceptanceTestingStore();
}

export function writeFounderAcceptanceTestingStore(fat: FatStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    founderAcceptanceTesting: {
      ...emptyFounderAcceptanceTestingStore(),
      ...fat,
      version: FAT_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateFounderAcceptanceTestingStore(
  mutator: (store: FatStore) => FatStore
): FatStore {
  const current = readFounderAcceptanceTestingStore();
  const next = mutator(current);
  writeFounderAcceptanceTestingStore(next);
  return next;
}
