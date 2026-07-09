import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { CORE_SYSTEMS_SUBSYSTEM_VERSION } from './constants';
import type { CoreSystemsStore } from './types';

export function emptyCoreSystemsStore(): CoreSystemsStore {
  return {
    version: CORE_SYSTEMS_SUBSYSTEM_VERSION,
    systems: [],
    dependencies: [],
    capabilities: [],
    boundaries: [],
    contracts: [],
    expansionHooks: [],
    lifecycleHistory: [],
  };
}

export function readCoreSystemsStore(): CoreSystemsStore {
  const genesis = readGenesisStore();
  return genesis.coreSystems ?? emptyCoreSystemsStore();
}

export function writeCoreSystemsStore(coreSystems: CoreSystemsStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    coreSystems: {
      ...emptyCoreSystemsStore(),
      ...coreSystems,
      version: CORE_SYSTEMS_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateCoreSystemsStore(
  mutator: (store: CoreSystemsStore) => CoreSystemsStore
): CoreSystemsStore {
  const current = readCoreSystemsStore();
  const next = mutator(current);
  writeCoreSystemsStore(next);
  return next;
}

export function ensureCoreSystemsStore(): CoreSystemsStore {
  const store = readCoreSystemsStore();
  if (!store.bootstrappedAt) {
    const seeded = {
      ...store,
      bootstrappedAt: new Date().toISOString(),
    };
    writeCoreSystemsStore(seeded);
    return seeded;
  }
  return store;
}
