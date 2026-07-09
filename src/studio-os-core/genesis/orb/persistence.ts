import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { ORB_SUBSYSTEM_VERSION } from './constants';
import type { OrbStore } from './types';

export function emptyOrbStore(): OrbStore {
  return {
    version: ORB_SUBSYSTEM_VERSION,
    session: null,
    memoryEntries: [],
    conversationTimeline: [],
    recommendationOverrides: [],
  };
}

export function readOrbStore(): OrbStore {
  const genesis = readGenesisStore();
  return genesis.orb ?? emptyOrbStore();
}

export function writeOrbStore(orb: OrbStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    orb: {
      ...emptyOrbStore(),
      ...orb,
      version: ORB_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateOrbStore(mutator: (store: OrbStore) => OrbStore): OrbStore {
  const current = readOrbStore();
  const next = mutator(current);
  writeOrbStore(next);
  return next;
}
