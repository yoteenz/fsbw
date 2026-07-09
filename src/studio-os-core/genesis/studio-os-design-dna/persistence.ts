import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { DDNA_SUBSYSTEM_VERSION } from './constants';
import type { DdnaStore } from './types';

export function emptyStudioOsDesignDnaStore(): DdnaStore {
  return {
    version: DDNA_SUBSYSTEM_VERSION,
    tokens: [],
    departmentThemes: [],
    sceneTemplate: {
      templateId: 'hq-master-scene',
      officialName: 'Headquarters Master Scene Template™',
      version: DDNA_SUBSYSTEM_VERSION,
      layers: [],
      gridColumns: 12,
      maxContentWidthPx: 1440,
      heroViewportPct: 68,
      orbPersistent: true,
    },
    glassMaterials: [],
    lightingPresets: [],
    motionPresets: [],
    animationHooks: [],
    typographyScale: [],
    components: [],
    navigationRules: [],
    iconTreatments: [],
    recommendations: [],
    activeDepartmentId: 'headquarters',
    constitutionLocked: true,
  };
}

export function readStudioOsDesignDnaStore(): DdnaStore {
  const genesis = readGenesisStore();
  return genesis.studioOsDesignDna ?? emptyStudioOsDesignDnaStore();
}

export function writeStudioOsDesignDnaStore(ddna: DdnaStore): void {
  mutateGenesisStore((store) => ({
    ...store,
    studioOsDesignDna: {
      ...emptyStudioOsDesignDnaStore(),
      ...ddna,
      version: DDNA_SUBSYSTEM_VERSION,
    },
  }));
}

export function mutateStudioOsDesignDnaStore(mutator: (store: DdnaStore) => DdnaStore): DdnaStore {
  const current = readStudioOsDesignDnaStore();
  const next = mutator(current);
  writeStudioOsDesignDnaStore(next);
  return next;
}
