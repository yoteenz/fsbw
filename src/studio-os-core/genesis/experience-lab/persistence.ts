import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { XELAB_DEFAULT_SWITCHERS, XELAB_SUBSYSTEM_VERSION } from './constants';
import type { XelabStore } from './types';

export function emptyExperienceLabStore(): XelabStore {
  return {
    version: XELAB_SUBSYSTEM_VERSION,
    selection: {
      scenarioId: 'studio-os-hq',
      brandId: 'studio-os',
      departmentId: 'executive',
      sceneId: 'executive-headquarters',
      motionDnaId: 'motion-studio-os',
      switchers: { ...XELAB_DEFAULT_SWITCHERS },
      activePanel: 'runtime-status',
    },
    switchCount: 0,
    constitutionLocked: true,
  };
}

/** Deep-merge persisted lab DNA so partial localStorage never drops selection or switchers. */
export function normalizeExperienceLabStore(stored?: Partial<XelabStore>): XelabStore {
  const empty = emptyExperienceLabStore();
  if (!stored) return empty;
  return {
    ...empty,
    ...stored,
    selection: {
      ...empty.selection,
      ...stored.selection,
      switchers: {
        ...empty.selection.switchers,
        ...stored.selection?.switchers,
      },
    },
  };
}

export function readExperienceLabStore(): XelabStore {
  const genesis = readGenesisStore();
  return normalizeExperienceLabStore(genesis.experienceLabDna);
}

export function writeExperienceLabStore(store: XelabStore): void {
  mutateGenesisStore((genesis) => ({
    ...genesis,
    experienceLabDna: normalizeExperienceLabStore({
      ...store,
      version: XELAB_SUBSYSTEM_VERSION,
    }),
  }));
}

export function mutateExperienceLabStore(mutator: (store: XelabStore) => XelabStore): XelabStore {
  const current = readExperienceLabStore();
  const next = mutator(current);
  writeExperienceLabStore(next);
  return next;
}
