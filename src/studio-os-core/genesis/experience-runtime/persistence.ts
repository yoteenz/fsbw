import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { XER_SUBSYSTEM_VERSION } from './constants';
import { XER_DEFAULT_RUNTIME_CONTRACT } from './runtime-boot/default-contract';
import type { XerStore } from './types';
import { getDefaultRuntimeSeed } from './runtime-boot/default-seed';

export function emptyExperienceRuntimeStore(): XerStore {
  const seed = getDefaultRuntimeSeed();
  return {
    version: XER_SUBSYSTEM_VERSION,
    platformDna: seed.platformDna,
    stateDnaProfiles: seed.stateDnaProfiles,
    selection: {
      brandId: XER_DEFAULT_RUNTIME_CONTRACT.brandId,
      departmentId: XER_DEFAULT_RUNTIME_CONTRACT.departmentId,
      sceneId: XER_DEFAULT_RUNTIME_CONTRACT.sceneId,
      componentId: XER_DEFAULT_RUNTIME_CONTRACT.componentId,
      motionDnaId: XER_DEFAULT_RUNTIME_CONTRACT.motionDnaId,
    },
    sessionId: '',
    sessionState: {},
    brandSwitchCount: 0,
    cacheStats: { hits: 0, misses: 0, entries: 0 },
    constitutionLocked: true,
  };
}

/** Deep-merge persisted runtime DNA so partial localStorage (Safari / upgrades) never drops selection. */
export function normalizeExperienceRuntimeStore(stored?: Partial<XerStore>): XerStore {
  const empty = emptyExperienceRuntimeStore();
  if (!stored) return empty;
  return {
    ...empty,
    ...stored,
    platformDna: {
      ...empty.platformDna,
      ...stored.platformDna,
      platformDnaId: stored.platformDna?.platformDnaId || empty.platformDna.platformDnaId,
      version: stored.platformDna?.version || empty.platformDna.version,
    },
    selection: { ...empty.selection, ...stored.selection },
    stateDnaProfiles:
      stored.stateDnaProfiles && stored.stateDnaProfiles.length > 0
        ? stored.stateDnaProfiles
        : empty.stateDnaProfiles,
    sessionState: stored.sessionState ?? empty.sessionState,
    cacheStats: { ...empty.cacheStats, ...stored.cacheStats },
  };
}

export function withExperienceRuntimeSeedFallback(stored?: Partial<XerStore>): XerStore {
  return normalizeExperienceRuntimeStore(stored);
}

export function readExperienceRuntimeStore(): XerStore {
  const genesis = readGenesisStore();
  return withExperienceRuntimeSeedFallback(genesis.experienceRuntimeDna);
}

export function writeExperienceRuntimeStore(store: XerStore): void {
  try {
    mutateGenesisStore((genesis) => ({
      ...genesis,
      experienceRuntimeDna: withExperienceRuntimeSeedFallback({
        ...store,
        version: XER_SUBSYSTEM_VERSION,
      }),
    }));
  } catch {
    // Safari quota / private mode — bundled seed still serves reads.
  }
}

export function mutateExperienceRuntimeStore(mutator: (store: XerStore) => XerStore): XerStore {
  const current = readExperienceRuntimeStore();
  const next = mutator(current);
  writeExperienceRuntimeStore(next);
  return next;
}
