import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { OBJECT_MODEL_SUBSYSTEM_VERSION } from './constants';
import type { ObjectModelStore } from './types';

export function emptyObjectModelStore(): ObjectModelStore {
  return {
    version: OBJECT_MODEL_SUBSYSTEM_VERSION,
    objects: [],
    relationships: [],
    historicalArchive: [],
  };
}

export function readObjectModelStore(): ObjectModelStore {
  const genesis = readGenesisStore();
  return genesis.objectModel ?? emptyObjectModelStore();
}

export function writeObjectModelStore(objectModel: ObjectModelStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    objectModel: {
      ...emptyObjectModelStore(),
      ...objectModel,
      version: OBJECT_MODEL_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateObjectModelStore(
  mutator: (store: ObjectModelStore) => ObjectModelStore
): ObjectModelStore {
  const current = readObjectModelStore();
  const next = mutator(current);
  writeObjectModelStore(next);
  return next;
}

export function ensureObjectModelStore(): ObjectModelStore {
  const store = readObjectModelStore();
  if (!store.bootstrappedAt) {
    const seeded = {
      ...store,
      bootstrappedAt: new Date().toISOString(),
    };
    writeObjectModelStore(seeded);
    return seeded;
  }
  return store;
}
