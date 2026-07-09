import { buildPlatformDna, buildStateDnaProfiles } from '../runtime-registry/platform-dna';
import { XER_DEFAULT_RUNTIME_CONTRACT } from './default-contract';
import type { XerPlatformDna, XerStateDna } from '../types';
import {
  SEED_BRAND_DNA,
  SEED_COMPONENT_DNA,
  SEED_DEPARTMENT_DNA,
  SEED_INTERACTION_DNA,
  SEED_MOTION_DNA,
  SEED_SCENE_DNA,
} from '../../experience-engine/bootstrap/seed-data';
import type {
  XeeBrandDna,
  XeeComponentDna,
  XeeDepartmentDna,
  XeeInteractionDna,
  XeeMotionDna,
  XeeSceneDna,
} from '../../experience-engine/types';

export type XerDefaultRuntimeSeed = {
  platformDna: XerPlatformDna;
  stateDnaProfiles: XerStateDna[];
  brandDna: XeeBrandDna[];
  departmentDna: XeeDepartmentDna[];
  sceneDna: XeeSceneDna[];
  componentDna: XeeComponentDna[];
  motionDna: XeeMotionDna[];
  interactionDna: XeeInteractionDna[];
  defaultStateDna: XerStateDna;
};

let cachedSeed: XerDefaultRuntimeSeed | null = null;

export function getDefaultRuntimeSeed(): XerDefaultRuntimeSeed {
  if (cachedSeed) return cachedSeed;

  const platformDna = buildPlatformDna();
  const stateDnaProfiles = buildStateDnaProfiles();
  const defaultStateDna =
    stateDnaProfiles.find((p) => p.sceneId === XER_DEFAULT_RUNTIME_CONTRACT.sceneId) ??
    stateDnaProfiles[0] ??
    buildFallbackStateDna();

  cachedSeed = {
    platformDna,
    stateDnaProfiles,
    brandDna: SEED_BRAND_DNA,
    departmentDna: SEED_DEPARTMENT_DNA,
    sceneDna: SEED_SCENE_DNA,
    componentDna: SEED_COMPONENT_DNA,
    motionDna: SEED_MOTION_DNA,
    interactionDna: SEED_INTERACTION_DNA,
    defaultStateDna,
  };
  return cachedSeed;
}

export function buildFallbackStateDna(): XerStateDna {
  return {
    stateDnaId: 'state-fallback-v1',
    version: XER_DEFAULT_RUNTIME_CONTRACT.stateDnaVersion,
    sceneId: XER_DEFAULT_RUNTIME_CONTRACT.sceneId,
    slots: [],
    liveSwitchPolicy: { preserveSlots: [], resetSlots: [] },
  };
}

export function safeStateDnaVersion(stateDna?: XerStateDna | null): string {
  return stateDna?.version ?? XER_DEFAULT_RUNTIME_CONTRACT.stateDnaVersion;
}

export function safePlatformVersion(platformDna?: XerPlatformDna | null): string {
  return platformDna?.version ?? XER_DEFAULT_RUNTIME_CONTRACT.platformDnaVersion;
}
