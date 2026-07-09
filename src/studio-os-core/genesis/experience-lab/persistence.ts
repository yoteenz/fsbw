import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { XELAB_DEFAULT_SWITCHERS, XELAB_SUBSYSTEM_VERSION } from './constants';
import type { XelabStore } from './types';

export function emptyExperienceLabStore(): XelabStore {
  return {
    version: XELAB_SUBSYSTEM_VERSION,
    selection: {
      scenarioId: 'studio-os-hq',
      brandId: 'studio-os',
      departmentId: 'headquarters',
      sceneId: 'hq-master-demonstration-v1',
      motionDnaId: 'motion-studio-os',
      switchers: { ...XELAB_DEFAULT_SWITCHERS },
      activePanel: 'runtime-status',
    },
    switchCount: 0,
    constitutionLocked: true,
  };
}

export function readExperienceLabStore(): XelabStore {
  const genesis = readGenesisStore();
  return genesis.experienceLabDna ?? emptyExperienceLabStore();
}

export function writeExperienceLabStore(store: XelabStore): void {
  mutateGenesisStore((genesis) => ({
    ...genesis,
    experienceLabDna: {
      ...emptyExperienceLabStore(),
      ...store,
      version: XELAB_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateExperienceLabStore(mutator: (store: XelabStore) => XelabStore): XelabStore {
  const current = readExperienceLabStore();
  const next = mutator(current);
  writeExperienceLabStore(next);
  return next;
}
