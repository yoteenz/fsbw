import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { ERS_SUBSYSTEM_VERSION } from './constants';
import type { ErsStore } from './types';

export function emptyExecutiveReflectionSuiteStore(): ErsStore {
  return {
    version: ERS_SUBSYSTEM_VERSION,
    sessions: [],
    archivedSessions: [],
    victories: [],
    lessons: [],
    failureStudies: [],
    innovationIdeas: [],
    decisionTimeline: [],
    boardroomPackets: [],
    futureScenarios: [],
    opportunitySignals: [],
    delightMoments: [],
    summitCapsules: [],
    retreatPackets: [],
  };
}

export function readExecutiveReflectionSuiteStore(): ErsStore {
  const genesis = readGenesisStore();
  return genesis.executiveReflectionSuite ?? emptyExecutiveReflectionSuiteStore();
}

export function writeExecutiveReflectionSuiteStore(ers: ErsStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    executiveReflectionSuite: {
      ...emptyExecutiveReflectionSuiteStore(),
      ...ers,
      version: ERS_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateExecutiveReflectionSuiteStore(
  mutator: (store: ErsStore) => ErsStore
): ErsStore {
  const current = readExecutiveReflectionSuiteStore();
  const next = mutator(current);
  writeExecutiveReflectionSuiteStore(next);
  return next;
}
