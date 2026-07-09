import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { DEPENDENCY_MAP_SUBSYSTEM_VERSION } from './constants';
import type { DependencyMapStore } from './types';

export function emptyDependencyMapStore(): DependencyMapStore {
  return {
    version: DEPENDENCY_MAP_SUBSYSTEM_VERSION,
    systems: [],
  };
}

export function readDependencyMapStore(): DependencyMapStore {
  const genesis = readGenesisStore();
  return genesis.dependencyMap ?? emptyDependencyMapStore();
}

export function writeDependencyMapStore(dependencyMap: DependencyMapStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    dependencyMap: {
      ...emptyDependencyMapStore(),
      ...dependencyMap,
      version: DEPENDENCY_MAP_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateDependencyMapStore(
  mutator: (store: DependencyMapStore) => DependencyMapStore
): DependencyMapStore {
  const current = readDependencyMapStore();
  const next = mutator(current);
  writeDependencyMapStore(next);
  return next;
}
