import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { XEE_SUBSYSTEM_VERSION } from './constants';
import type { XeeStore } from './types';

export function emptyExperienceEngineDnaStore(): XeeStore {
  return {
    version: XEE_SUBSYSTEM_VERSION,
    brands: [],
    departments: [],
    scenes: [],
    components: [],
    motions: [],
    interactions: [],
    playground: {
      brandId: 'studio-os',
      departmentId: 'headquarters',
      sceneId: 'hq-master-demonstration-v1',
      componentId: 'executive-header',
      motionDnaId: 'motion-studio-os',
      lightingPreset: 'brand-default',
      materialId: 'primary-glass',
      typographyScale: 'brand-default',
      orbPersonality: 'brand-default',
    },
    constitutionLocked: true,
  };
}

export function readExperienceEngineDnaStore(): XeeStore {
  const genesis = readGenesisStore();
  return genesis.experienceEngineDna ?? emptyExperienceEngineDnaStore();
}

export function writeExperienceEngineDnaStore(store: XeeStore): void {
  mutateGenesisStore((genesis) => ({
    ...genesis,
    experienceEngineDna: {
      ...emptyExperienceEngineDnaStore(),
      ...store,
      version: XEE_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateExperienceEngineDnaStore(mutator: (store: XeeStore) => XeeStore): XeeStore {
  const current = readExperienceEngineDnaStore();
  const next = mutator(current);
  writeExperienceEngineDnaStore(next);
  return next;
}
