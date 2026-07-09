import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { LVS_SUBSYSTEM_VERSION } from './constants';
import type { LvsStore } from './types';

export function emptyLiveValidationSystemStore(): LvsStore {
  return {
    version: LVS_SUBSYSTEM_VERSION,
    signals: [],
    diaryPrompts: [],
    diaryAnswers: [],
    escapeEvents: [],
    escapePatterns: [],
    systemHealth: [],
    confidenceReadings: [],
    adoptionReadings: [],
    valueReadings: [],
    genesisProposals: [],
    architecturalHistory: [],
    weeklyReviews: [],
    diaryPaused: false,
  };
}

export function readLiveValidationSystemStore(): LvsStore {
  const genesis = readGenesisStore();
  return genesis.liveValidationSystem ?? emptyLiveValidationSystemStore();
}

export function writeLiveValidationSystemStore(lvs: LvsStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    liveValidationSystem: {
      ...emptyLiveValidationSystemStore(),
      ...lvs,
      version: LVS_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateLiveValidationSystemStore(
  mutator: (store: LvsStore) => LvsStore
): LvsStore {
  const current = readLiveValidationSystemStore();
  const next = mutator(current);
  writeLiveValidationSystemStore(next);
  return next;
}
