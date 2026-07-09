import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { APL_SUBSYSTEM_VERSION } from './constants';
import type { AplStore } from './types';

export function emptyArchitectsPromptLibraryStore(): AplStore {
  return {
    version: APL_SUBSYSTEM_VERSION,
    prompts: [],
    versions: [],
    collections: [],
    dependencies: [],
    relationships: [],
    executions: [],
    validations: [],
    modelPerformance: [],
    lessons: [],
    outputs: [],
    genesisRefs: [],
    launchStackRefs: [],
    coreSystemRefs: [],
    comparisons: [],
    recommendations: [],
    archivedPromptIds: [],
    orbLibrarianMode: true,
  };
}

export function readArchitectsPromptLibraryStore(): AplStore {
  const genesis = readGenesisStore();
  return genesis.architectsPromptLibrary ?? emptyArchitectsPromptLibraryStore();
}

export function writeArchitectsPromptLibraryStore(apl: AplStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    architectsPromptLibrary: {
      ...emptyArchitectsPromptLibraryStore(),
      ...apl,
      version: APL_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateArchitectsPromptLibraryStore(
  mutator: (store: AplStore) => AplStore
): AplStore {
  const current = readArchitectsPromptLibraryStore();
  const next = mutator(current);
  writeArchitectsPromptLibraryStore(next);
  return next;
}
