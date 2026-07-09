import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { XEE_SUBSYSTEM_VERSION } from './constants';
import type { XeeStore } from './types';
import {
  SEED_BRAND_DNA,
  SEED_COMPONENT_DNA,
  SEED_DEPARTMENT_DNA,
  SEED_INTERACTION_DNA,
  SEED_MOTION_DNA,
  SEED_SCENE_DNA,
} from './bootstrap/seed-data';

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

/** In-memory canonical seed — used when localStorage has seededAt but empty registries (Safari / partial writes). */
export function withExperienceEngineSeedFallback(stored?: Partial<XeeStore>): XeeStore {
  const normalized = normalizeExperienceEngineDnaStore(stored);
  const hasRegistry =
    normalized.brands.length > 0 &&
    normalized.departments.length > 0 &&
    normalized.scenes.length > 0 &&
    normalized.motions.length > 0 &&
    normalized.interactions.length > 0;
  if (hasRegistry) return normalized;
  return {
    ...normalized,
    brands: SEED_BRAND_DNA,
    departments: SEED_DEPARTMENT_DNA,
    scenes: SEED_SCENE_DNA,
    components: SEED_COMPONENT_DNA,
    motions: SEED_MOTION_DNA,
    interactions: SEED_INTERACTION_DNA,
    seededAt: normalized.seededAt ?? new Date().toISOString(),
    bootstrappedAt: normalized.bootstrappedAt ?? new Date().toISOString(),
  };
}

export function readExperienceEngineDnaStore(): XeeStore {
  const genesis = readGenesisStore();
  return withExperienceEngineSeedFallback(genesis.experienceEngineDna);
}

export function writeExperienceEngineDnaStore(store: XeeStore): void {
  try {
    mutateGenesisStore((genesis) => ({
      ...genesis,
      experienceEngineDna: withExperienceEngineSeedFallback({
        ...store,
        version: XEE_SUBSYSTEM_VERSION,
      }),
    }));
  } catch {
    // Safari quota / private mode — in-memory seed fallback still serves reads.
  }
}

export function mutateExperienceEngineDnaStore(mutator: (store: XeeStore) => XeeStore): XeeStore {
  const current = readExperienceEngineDnaStore();
  const next = mutator(current);
  writeExperienceEngineDnaStore(next);
  return next;
}
