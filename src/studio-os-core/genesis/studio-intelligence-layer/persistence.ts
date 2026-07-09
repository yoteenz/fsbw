import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { XSIL_SUBSYSTEM_VERSION } from './constants';
import type { XsilStore } from './types';

export function emptyStudioIntelligenceLayerStore(): XsilStore {
  return {
    version: XSIL_SUBSYSTEM_VERSION,
    companyRegistry: [],
    operatingManualRegistry: [],
    decisionRegistry: [],
    tasteRegistry: [],
    audienceRegistry: [],
    productRegistry: [],
    creativeRegistry: [],
    canonRegistry: [],
    experienceRegistry: [],
    playground: { companyId: 'studio-os' },
    constitutionLocked: true,
  };
}

export function readStudioIntelligenceLayerStore(): XsilStore {
  const genesis = readGenesisStore();
  return genesis.studioIntelligenceLayerDna ?? emptyStudioIntelligenceLayerStore();
}

export function writeStudioIntelligenceLayerStore(store: XsilStore): void {
  mutateGenesisStore((genesis) => ({
    ...genesis,
    studioIntelligenceLayerDna: {
      ...emptyStudioIntelligenceLayerStore(),
      ...store,
      version: XSIL_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateStudioIntelligenceLayerStore(mutator: (store: XsilStore) => XsilStore): XsilStore {
  const current = readStudioIntelligenceLayerStore();
  const next = mutator(current);
  writeStudioIntelligenceLayerStore(next);
  return next;
}
