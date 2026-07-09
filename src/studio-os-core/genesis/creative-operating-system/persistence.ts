import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { XCOS_SUBSYSTEM_VERSION } from './constants';
import type { XcosOrgState } from './constants';
import type { XcosStore } from './types';

export function emptyCreativeOperatingSystemStore(): XcosStore {
  return {
    version: XCOS_SUBSYSTEM_VERSION,
    orgState: 'listening',
    boardMeetings: [],
    memoryRecords: [],
    evolutionProposals: [],
    economyAssets: [],
    governanceRecords: [],
    constitutionLocked: true,
  };
}

export function readCreativeOperatingSystemStore(): XcosStore {
  const genesis = readGenesisStore();
  return genesis.creativeOperatingSystemDna ?? emptyCreativeOperatingSystemStore();
}

export function writeCreativeOperatingSystemStore(store: XcosStore): void {
  mutateGenesisStore((genesis) => ({
    ...genesis,
    creativeOperatingSystemDna: {
      ...emptyCreativeOperatingSystemStore(),
      ...store,
      version: XCOS_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateCreativeOperatingSystemStore(mutator: (store: XcosStore) => XcosStore): XcosStore {
  const current = readCreativeOperatingSystemStore();
  const next = mutator(current);
  writeCreativeOperatingSystemStore(next);
  return next;
}

export function setCreativeOrgState(state: XcosOrgState): void {
  mutateCreativeOperatingSystemStore((store) => ({ ...store, orgState: state }));
}
