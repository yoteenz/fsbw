import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { XNI_SUBSYSTEM_VERSION } from './constants';
import type { XniStore } from './types';

export function emptyNarrativeIntelligenceStore(): XniStore {
  return {
    version: XNI_SUBSYSTEM_VERSION,
    productionGenomeRegistry: [],
    blueprintRegistry: [],
    playground: {
      topic: 'Why Studio OS exists',
      brandId: 'studio-os',
      companyId: 'studio-os',
      narrativeType: 'episode',
    },
    constitutionLocked: true,
  };
}

export function readNarrativeIntelligenceStore(): XniStore {
  const genesis = readGenesisStore();
  return genesis.narrativeIntelligenceDna ?? emptyNarrativeIntelligenceStore();
}

export function writeNarrativeIntelligenceStore(store: XniStore): void {
  mutateGenesisStore((genesis) => ({
    ...genesis,
    narrativeIntelligenceDna: {
      ...emptyNarrativeIntelligenceStore(),
      ...store,
      version: XNI_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateNarrativeIntelligenceStore(mutator: (store: XniStore) => XniStore): XniStore {
  const current = readNarrativeIntelligenceStore();
  const next = mutator(current);
  writeNarrativeIntelligenceStore(next);
  return next;
}
