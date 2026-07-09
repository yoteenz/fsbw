import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { XPS_SUBSYSTEM_VERSION } from './constants';
import type { XpsStore } from './types';

export function emptyStudioProductionSystemStore(): XpsStore {
  return {
    version: XPS_SUBSYSTEM_VERSION,
    packageRegistry: [],
    playground: {
      topic: 'Why Studio OS preserves expertise',
      audience: 'Visionary founders building legacy institutions',
      goal: 'Explain the operating civilization promise',
      brandId: 'studio-os',
      companyId: 'studio-os',
      platform: 'youtube',
      desiredEmotion: 'calm + intelligent',
    },
    constitutionLocked: true,
  };
}

export function readStudioProductionSystemStore(): XpsStore {
  const genesis = readGenesisStore();
  return genesis.studioProductionSystemDna ?? emptyStudioProductionSystemStore();
}

export function writeStudioProductionSystemStore(store: XpsStore): void {
  mutateGenesisStore((genesis) => ({
    ...genesis,
    studioProductionSystemDna: {
      ...emptyStudioProductionSystemStore(),
      ...store,
      version: XPS_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateStudioProductionSystemStore(mutator: (store: XpsStore) => XpsStore): XpsStore {
  const current = readStudioProductionSystemStore();
  const next = mutator(current);
  writeStudioProductionSystemStore(next);
  return next;
}
