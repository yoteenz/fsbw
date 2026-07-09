import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { EXECUTIVE_HEADQUARTERS_SUBSYSTEM_VERSION } from './constants';
import type { ExecutiveHeadquartersStore } from './types';

export function emptyExecutiveHeadquartersStore(): ExecutiveHeadquartersStore {
  return {
    version: EXECUTIVE_HEADQUARTERS_SUBSYSTEM_VERSION,
    rooms: [],
    arrivalSession: null,
    priorities: [],
    recommendedAction: null,
    advisories: [],
  };
}

export function readExecutiveHeadquartersStore(): ExecutiveHeadquartersStore {
  const genesis = readGenesisStore();
  return genesis.executiveHeadquarters ?? emptyExecutiveHeadquartersStore();
}

export function writeExecutiveHeadquartersStore(
  executiveHeadquarters: ExecutiveHeadquartersStore
): void {
  mutateGenesisStore((store) => ({
    ...store,
    executiveHeadquarters: {
      ...emptyExecutiveHeadquartersStore(),
      ...executiveHeadquarters,
      version: EXECUTIVE_HEADQUARTERS_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateExecutiveHeadquartersStore(
  mutator: (store: ExecutiveHeadquartersStore) => ExecutiveHeadquartersStore
): ExecutiveHeadquartersStore {
  const current = readExecutiveHeadquartersStore();
  const next = mutator(current);
  writeExecutiveHeadquartersStore(next);
  return next;
}
