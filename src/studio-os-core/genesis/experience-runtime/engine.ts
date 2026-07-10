import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import {
  ensureExperienceRuntimeStore,
  recordExperienceRuntimeOpened,
  seedExperienceRuntimeStore,
  updateRuntimeSelectionStore,
} from './bootstrap/seed';
import {
  assembleExperienceRuntime,
  applyRuntimeGraphToElement,
  switchRuntimeBrandLive,
  updateRuntimeSelection,
  getRuntimeSessionState,
} from './runtime-engine/experience-runtime';
import { buildRuntimeInspectorView } from './runtime-preview/inspector-view';
import { updateSessionStateSlot } from './runtime-state/session-state';
import { buildExperienceRuntimeReadyView, isValidXerRoomPath, xerRoomPathFromSlug } from './room/ready-view';
import {
  mutateExperienceRuntimeStore,
  readExperienceRuntimeStore,
} from './persistence';
import {
  XER_DEMO_BRAND_IDS,
  XER_DEMO_BRAND_LABELS,
  XER_ROOM_PATH_LABELS,
  XER_ROOM_PATHS,
  XER_SHARED_SCENE_ID,
  XER_SCENE_NODE_IDS,
  XER_SUBSYSTEM_NAME,
  XER_SUBSYSTEM_VERSION,
} from './constants';

export function ensureExperienceRuntimeSubsystem() {
  const store = ensureExperienceRuntimeStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('experience-runtime', 'implemented');
  }
  return store;
}

/** Imperative read — call ensureExperienceRuntimeSubsystem() before this when bootstrapping. */
export function getExperienceRuntimeReadyView(input?: import('./types').XerRuntimeInput) {
  return buildExperienceRuntimeReadyView(input);
}

export {
  XER_SUBSYSTEM_NAME,
  XER_SUBSYSTEM_VERSION,
  XER_ROOM_PATHS,
  XER_ROOM_PATH_LABELS,
  XER_DEMO_BRAND_IDS,
  XER_DEMO_BRAND_LABELS,
  XER_SHARED_SCENE_ID,
  XER_SCENE_NODE_IDS,
  isValidXerRoomPath,
  xerRoomPathFromSlug,
  readExperienceRuntimeStore,
  mutateExperienceRuntimeStore,
  seedExperienceRuntimeStore,
  ensureExperienceRuntimeStore,
  recordExperienceRuntimeOpened,
  updateRuntimeSelectionStore,
  buildExperienceRuntimeReadyView,
  buildRuntimeInspectorView,
  assembleExperienceRuntime,
  applyRuntimeGraphToElement,
  switchRuntimeBrandLive,
  updateRuntimeSelection,
  getRuntimeSessionState,
  updateSessionStateSlot,
};

export {
  validateRuntimeBoot,
  resolveRuntimeSelection,
  XER_DEFAULT_RUNTIME_CONTRACT,
} from './runtime-boot';

export type { XerRuntimeBootReport } from './runtime-boot/runtime-boot-validator';

export type {
  XerStore,
  XerReadyView,
  XerRuntimeGraph,
  XerInspectorView,
  XerPlatformDna,
  XerStateDna,
  XerRuntimeSelection,
  XerRenderNode,
  XerPerformanceMetrics,
  XerRuntimeInput,
} from './types';

export type { XerRoomPath, XerDemoBrandId } from './constants';
