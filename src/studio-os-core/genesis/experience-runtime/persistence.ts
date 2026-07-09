import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { XER_SUBSYSTEM_VERSION } from './constants';
import type { XerStore } from './types';

export function emptyExperienceRuntimeStore(): XerStore {
  return {
    version: XER_SUBSYSTEM_VERSION,
    platformDna: {
      platformDnaId: 'studio-os-platform-v1',
      version: '1.0.0',
      routeAnatomy: [],
      layoutPrimitives: [],
      accessibilityFloor: [],
      sceneGraphContract: '',
      orbMountContract: '',
      dataSlotContract: '',
      componentAnatomyIds: [],
    },
    stateDnaProfiles: [],
    selection: {
      brandId: 'studio-os',
      departmentId: 'headquarters',
      sceneId: 'hq-master-demonstration-v1',
      componentId: 'executive-header',
      motionDnaId: 'motion-studio-os',
    },
    sessionId: '',
    sessionState: {},
    brandSwitchCount: 0,
    cacheStats: { hits: 0, misses: 0, entries: 0 },
    constitutionLocked: true,
  };
}

export function readExperienceRuntimeStore(): XerStore {
  const genesis = readGenesisStore();
  return genesis.experienceRuntimeDna ?? emptyExperienceRuntimeStore();
}

export function writeExperienceRuntimeStore(store: XerStore): void {
  mutateGenesisStore((genesis) => ({
    ...genesis,
    experienceRuntimeDna: {
      ...emptyExperienceRuntimeStore(),
      ...store,
      version: XER_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateExperienceRuntimeStore(mutator: (store: XerStore) => XerStore): XerStore {
  const current = readExperienceRuntimeStore();
  const next = mutator(current);
  writeExperienceRuntimeStore(next);
  return next;
}
