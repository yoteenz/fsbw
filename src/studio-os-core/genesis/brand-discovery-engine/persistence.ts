import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { XBD_SUBSYSTEM_VERSION } from './constants';
import type { XbdStore } from './types';

export function emptyBrandDiscoveryEngineStore(): XbdStore {
  return {
    version: XBD_SUBSYSTEM_VERSION,
    brandRegistry: [],
    discoverySession: {
      sessionId: '',
      companyId: 'studio-os-platform',
      status: 'intake',
      stepIndex: 0,
      inputs: {
        founderAnswers: {},
        uploadedAssets: [],
        brandReferences: [],
        audienceDetails: '',
        competitorReferences: [],
        visualPreferences: [],
        copySamples: [],
        productDetails: '',
      },
      orbPrompt: 'Tell me why this brand exists — and who it refuses to serve.',
      updatedAt: new Date().toISOString(),
    },
    playground: {
      brandId: 'studio-os',
      assetType: 'packaging',
      sampleArtifactSummary: 'Primary product packaging concept',
    },
    elevationReports: [],
    constitutionLocked: true,
  };
}

export function readBrandDiscoveryEngineStore(): XbdStore {
  const genesis = readGenesisStore();
  return genesis.brandDiscoveryEngineDna ?? emptyBrandDiscoveryEngineStore();
}

export function writeBrandDiscoveryEngineStore(store: XbdStore): void {
  mutateGenesisStore((genesis) => ({
    ...genesis,
    brandDiscoveryEngineDna: {
      ...emptyBrandDiscoveryEngineStore(),
      ...store,
      version: XBD_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateBrandDiscoveryEngineStore(mutator: (store: XbdStore) => XbdStore): XbdStore {
  const current = readBrandDiscoveryEngineStore();
  const next = mutator(current);
  writeBrandDiscoveryEngineStore(next);
  return next;
}
