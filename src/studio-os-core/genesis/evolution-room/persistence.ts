import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { ER_SUBSYSTEM_VERSION } from './constants';
import type { ErStore } from './types';

export function emptyEvolutionRoomStore(): ErStore {
  return {
    version: ER_SUBSYSTEM_VERSION,
    sessions: [],
    archivedSessions: [],
    legacyWall: [],
    futureWall: [],
    founderTimeline: [],
    strategicPriorities: [],
    automationSuggestions: [],
  };
}

export function readEvolutionRoomStore(): ErStore {
  const genesis = readGenesisStore();
  return genesis.evolutionRoom ?? emptyEvolutionRoomStore();
}

export function writeEvolutionRoomStore(er: ErStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    evolutionRoom: {
      ...emptyEvolutionRoomStore(),
      ...er,
      version: ER_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateEvolutionRoomStore(mutator: (store: ErStore) => ErStore): ErStore {
  const current = readEvolutionRoomStore();
  const next = mutator(current);
  writeEvolutionRoomStore(next);
  return next;
}
