import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import {
  ensureExperienceEngineDnaStore,
  listBrandDna,
  listDepartmentDnaForBrand,
  recordExperienceEngineOpened,
  seedExperienceEngineDnaStore,
  updatePlaygroundSelection,
  getBrandDna,
  getDepartmentDna,
} from './bootstrap/seed';
import {
  getBrandRegistry,
  getComponentRegistry,
  getDepartmentRegistry,
  getExperienceEnginePlatformStats,
  getInteractionRegistry,
  getMotionRegistry,
  getSceneRegistry,
  buildXeeOrbNote,
  resolveBrandDna,
} from './engines/registries';
import {
  applyExperienceProfileToElement,
  buildExperienceCssOutput,
  resolveExperienceProfile,
} from './engines/experience-generator';
import {
  buildExperienceEngineReadyView,
  isValidXeeRoomPath,
  xeeRoomPathFromSlug,
} from './room/ready-view';
import {
  mutateExperienceEngineDnaStore,
  readExperienceEngineDnaStore,
} from './persistence';
import {
  XEE_DEMO_BRAND_IDS,
  XEE_DEMO_BRAND_LABELS,
  XEE_ROOM_PATH_LABELS,
  XEE_ROOM_PATHS,
  XEE_SHARED_SCENE_ID,
  XEE_SUBSYSTEM_NAME,
  XEE_SUBSYSTEM_VERSION,
} from './constants';

export function ensureExperienceEngineDnaSubsystem() {
  const store = ensureExperienceEngineDnaStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('experience-engine', 'implemented');
  }
  return store;
}

export function getExperienceEngineReadyView(input?: {
  pathname?: string;
  playground?: Partial<import('./types').XeePlaygroundSelection>;
}) {
  ensureExperienceEngineDnaSubsystem();
  recordExperienceEngineOpened();
  return buildExperienceEngineReadyView(input);
}

export {
  XEE_SUBSYSTEM_NAME,
  XEE_SUBSYSTEM_VERSION,
  XEE_ROOM_PATHS,
  XEE_ROOM_PATH_LABELS,
  XEE_DEMO_BRAND_IDS,
  XEE_DEMO_BRAND_LABELS,
  XEE_SHARED_SCENE_ID,
  isValidXeeRoomPath,
  xeeRoomPathFromSlug,
  readExperienceEngineDnaStore,
  mutateExperienceEngineDnaStore,
  seedExperienceEngineDnaStore,
  ensureExperienceEngineDnaStore,
  recordExperienceEngineOpened,
  updatePlaygroundSelection,
  buildExperienceEngineReadyView,
  getExperienceEnginePlatformStats,
  buildXeeOrbNote,
  getBrandRegistry,
  getDepartmentRegistry,
  getSceneRegistry,
  getComponentRegistry,
  getMotionRegistry,
  getInteractionRegistry,
  listBrandDna,
  listDepartmentDnaForBrand,
  getBrandDna,
  getDepartmentDna,
  resolveBrandDna,
  resolveExperienceProfile,
  applyExperienceProfileToElement,
  buildExperienceCssOutput,
};

export type {
  XeeStore,
  XeeReadyView,
  XeeBrandDna,
  XeeDepartmentDna,
  XeeSceneDna,
  XeeComponentDna,
  XeeMotionDna,
  XeeInteractionDna,
  XeeExperienceProfile,
  XeePlaygroundSelection,
  XeePlatformStats,
  XeeRuntimeInput,
} from './types';

export type { XeeRoomPath, XeeDemoBrandId } from './constants';
