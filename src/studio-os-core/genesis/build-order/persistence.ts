import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { BUILD_ORDER_SUBSYSTEM_VERSION } from './constants';
import type { BuildOrderStore } from './types';

export function emptyBuildOrderStore(): BuildOrderStore {
  return {
    version: BUILD_ORDER_SUBSYSTEM_VERSION,
    systems: [],
  };
}

export function readBuildOrderStore(): BuildOrderStore {
  const genesis = readGenesisStore();
  return genesis.buildOrder ?? emptyBuildOrderStore();
}

export function writeBuildOrderStore(buildOrder: BuildOrderStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    buildOrder: {
      ...emptyBuildOrderStore(),
      ...buildOrder,
      version: BUILD_ORDER_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateBuildOrderStore(
  mutator: (store: BuildOrderStore) => BuildOrderStore
): BuildOrderStore {
  const current = readBuildOrderStore();
  const next = mutator(current);
  writeBuildOrderStore(next);
  return next;
}
