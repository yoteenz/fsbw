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

/** Deep-merge persisted engine DNA so partial localStorage never drops playground or registries. */
export function normalizeExperienceEngineDnaStore(stored?: Partial<XeeStore>): XeeStore {
  const empty = emptyExperienceEngineDnaStore();
  if (!stored) return empty;
  return {
    ...empty,
    ...stored,
    playground: { ...empty.playground, ...stored.playground },
    brands: stored.brands?.length ? stored.brands : empty.brands,
    departments: stored.departments?.length ? stored.departments : empty.departments,
    scenes: stored.scenes?.length ? stored.scenes : empty.scenes,
    components: stored.components?.length ? stored.components : empty.components,
    motions: stored.motions?.length ? stored.motions : empty.motions,
    interactions: stored.interactions?.length ? stored.interactions : empty.interactions,
  };
}

export function readExperienceEngineDnaStore(): XeeStore {
  const genesis = readGenesisStore();
  return normalizeExperienceEngineDnaStore(genesis.experienceEngineDna);
}

export function writeExperienceEngineDnaStore(store: XeeStore): void {
  mutateGenesisStore((genesis) => ({
    ...genesis,
    experienceEngineDna: normalizeExperienceEngineDnaStore({
      ...store,
      version: XEE_SUBSYSTEM_VERSION,
    }),
  }));
}

export function mutateExperienceEngineDnaStore(mutator: (store: XeeStore) => XeeStore): XeeStore {
  const current = readExperienceEngineDnaStore();
  const next = mutator(current);
  writeExperienceEngineDnaStore(next);
  return next;
}
