import { GENESIS_FRAMEWORK_VERSION } from '../constants';
import type { GenesisStore } from '../types';

/** No hardcoded Studio World content — framework-only bootstrap. */
export function bootstrapGenesisStoreIfEmpty(store: GenesisStore): GenesisStore {
  if (store.bootstrappedAt) return store;

  return {
    ...store,
    version: GENESIS_FRAMEWORK_VERSION,
    frameworkVersion: GENESIS_FRAMEWORK_VERSION,
    bootstrappedAt: new Date().toISOString(),
  };
}
