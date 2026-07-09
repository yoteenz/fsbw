import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { XER_SUBSYSTEM_VERSION } from './constants';
import { XER_DEFAULT_RUNTIME_CONTRACT } from './runtime-boot/default-contract';
import type { XerPlatformDna, XerStateDna, XerStore } from './types';

/** Inline minimal defaults — no seed-data import at module init (avoids circular boot). */
function minimalEmptyPlatformDna(): XerPlatformDna {
  return {
    platformDnaId: 'platform-studio-os',
    version: XER_DEFAULT_RUNTIME_CONTRACT.platformDnaVersion,
    routeAnatomy: ['route-shell'],
    layoutPrimitives: ['fixed-scene-grid'],
    accessibilityFloor: ['keyboard-focus-visible'],
    sceneGraphContract: 'minimal-empty',
    orbMountContract: 'minimal-empty',
    dataSlotContract: 'minimal-empty',
    componentAnatomyIds: ['executive-header'],
  };
}

function minimalEmptyStateProfiles(): XerStateDna[] {
  return [
    {
      stateDnaId: 'state-fallback-v1',
      version: XER_DEFAULT_RUNTIME_CONTRACT.stateDnaVersion,
      sceneId: XER_DEFAULT_RUNTIME_CONTRACT.sceneId,
      slots: [],
      liveSwitchPolicy: { preserveSlots: [], resetSlots: [] },
    },
  ];
}

export function emptyExperienceRuntimeStore(): XerStore {
  return {
    version: XER_SUBSYSTEM_VERSION,
    platformDna: minimalEmptyPlatformDna(),
    stateDnaProfiles: minimalEmptyStateProfiles(),
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
