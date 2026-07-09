import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import {
  ensureStudioOsDesignDnaStore,
  listComponentSpecs,
  listDepartmentThemes,
  listDesignTokens,
  recordStudioOsDesignDnaOpened,
  seedStudioOsDesignDnaStore,
  setActiveDepartmentTheme,
  getDepartmentTheme,
  getSceneTemplate,
} from './bootstrap/seed';
import {
  applyDesignDnaToElement,
  buildDdnaOrbArchitectNote,
  buildDdnaOrbRecommendations,
  getDesignTokenRegistry,
  getDesignTokensByCategory,
  getDepartmentThemeRegistry,
  getStudioOsDesignDnaPlatformStats,
  resolveCognitiveNavigationContext,
  resolveDepartmentTheme,
  resolveDesignDnaSceneProfile,
} from './engines/registry-engines';
import {
  getAnimationEngine,
  getCognitiveNavigationRules,
  getComponentLibraryEngine,
  getGlassMaterialEngine,
  getIconSystemEngine,
  getLightingEngine,
  getMotionEngine,
  getSceneTemplateEngine,
  getTypographyEngine,
  resolveGlassMaterialForDepartment,
  resolveLightingForDepartment,
  resolveMotionForDepartment,
} from './engines/scene-engines';
import { buildDesignDnaCssOutput, mergeDesignTokenEngineCatalog } from './engines/css-output-engine';
import {
  buildStudioOsDesignDnaReadyView,
  ddnaRoomPathFromSlug,
  isValidDdnaRoomPath,
} from './room/ready-view';
import {
  mutateStudioOsDesignDnaStore,
  readStudioOsDesignDnaStore,
} from './persistence';
import {
  DDNA_ROOM_PATH_LABELS,
  DDNA_ROOM_PATHS,
  DDNA_SCENE_LAYER_LABELS,
  DDNA_SUBSYSTEM_NAME,
  DDNA_SUBSYSTEM_VERSION,
  DDNA_TOKEN_CATEGORIES,
} from './constants';

export function ensureStudioOsDesignDnaSubsystem() {
  const store = ensureStudioOsDesignDnaStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('studio-os-design-dna', 'implemented');
  }
  return store;
}

export function getStudioOsDesignDnaReadyView(input?: {
  pathname?: string;
  departmentId?: string;
  founderDisplayName?: string;
}) {
  ensureStudioOsDesignDnaSubsystem();
  recordStudioOsDesignDnaOpened();
  return buildStudioOsDesignDnaReadyView(input);
}

export {
  DDNA_SUBSYSTEM_NAME,
  DDNA_SUBSYSTEM_VERSION,
  DDNA_ROOM_PATHS,
  DDNA_ROOM_PATH_LABELS,
  DDNA_TOKEN_CATEGORIES,
  DDNA_SCENE_LAYER_LABELS,
  isValidDdnaRoomPath,
  ddnaRoomPathFromSlug,
  readStudioOsDesignDnaStore,
  mutateStudioOsDesignDnaStore,
  seedStudioOsDesignDnaStore,
  ensureStudioOsDesignDnaStore,
  recordStudioOsDesignDnaOpened,
  setActiveDepartmentTheme,
  buildStudioOsDesignDnaReadyView,
  getStudioOsDesignDnaPlatformStats,
  buildDdnaOrbRecommendations,
  buildDdnaOrbArchitectNote,
  getDesignTokenRegistry,
  getDesignTokensByCategory,
  getDepartmentThemeRegistry,
  listDesignTokens,
  listDepartmentThemes,
  getDepartmentTheme,
  getSceneTemplate,
  listComponentSpecs,
  resolveDepartmentTheme,
  resolveDesignDnaSceneProfile,
  resolveCognitiveNavigationContext,
  applyDesignDnaToElement,
  buildDesignDnaCssOutput,
  mergeDesignTokenEngineCatalog,
  getGlassMaterialEngine,
  resolveGlassMaterialForDepartment,
  getLightingEngine,
  resolveLightingForDepartment,
  getMotionEngine,
  resolveMotionForDepartment,
  getAnimationEngine,
  getTypographyEngine,
  getComponentLibraryEngine,
  getCognitiveNavigationRules,
  getIconSystemEngine,
  getSceneTemplateEngine,
};

export type {
  DdnaStore,
  DdnaReadyView,
  DdnaPlatformStats,
  DdnaDesignToken,
  DdnaDepartmentTheme,
  DdnaSceneTemplate,
  DdnaSceneLayerSpec,
  DdnaGlassMaterial,
  DdnaLightingPreset,
  DdnaMotionPreset,
  DdnaAnimationHook,
  DdnaTypographyScale,
  DdnaComponentSpec,
  DdnaNavigationRule,
  DdnaIconTreatment,
  DdnaRecommendation,
  DdnaSceneProfile,
  DdnaNavigationContext,
  DdnaRuntimeInput,
} from './types';

export type { DdnaRoomPath, DdnaTokenCategory, DdnaSceneLayerId } from './constants';
