import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import {
  ensureStudioProductionSystemStore,
  recordStudioProductionSystemOpened,
  seedStudioProductionSystemStore,
  updateProductionPlaygroundSelection,
} from './bootstrap/seed';
import {
  approveGate,
  authorizeAssetGeneration,
  buildDefaultApprovalGates,
  canGenerateAssets,
  evaluateApprovalGate,
  submitPackageForApproval,
} from './engines/approval-engine';
import { assignProductionDepartments, listAllDepartmentIds } from './engines/department-orchestrator';
import {
  coordinateProduction,
  evaluatePackageProductionGate,
  getProductionPackage,
  listProductionPackages,
  saveProductionPackage,
} from './engines/production-coordinator';
import { evaluateCreativeExecutiveFit } from './engines/creative-executive-engine';
import { evaluateShowrunnerContinuity } from './engines/showrunner-engine';
import {
  advanceTimelineStage,
  buildProductionTimeline,
  getActiveTimelineEvent,
} from './engines/production-timeline';
import { buildAssetChecklist, countAssetsByStatus, markAssetReady } from './engines/asset-tracker';
import { buildPublishingPlan, markPublishingReady } from './engines/distribution-engine';
import {
  buildProductionPlaygroundPreview,
  getLastProductionPreview,
} from './engines/production-playground-engine';
import { listProductionConsumerBindings } from './engines/production-consumer-engine';
import {
  buildStudioProductionSystemReadyView,
  isValidXpsRoomPath,
  xpsRoomPathFromSlug,
} from './room/ready-view';
import {
  mutateStudioProductionSystemStore,
  readStudioProductionSystemStore,
} from './persistence';
import {
  XPS_CONSUMER_SYSTEMS,
  XPS_DEMO_BRAND_IDS,
  XPS_DEMO_BRAND_LABELS,
  XPS_DEPARTMENT_LABELS,
  XPS_PLATFORM_LABELS,
  XPS_PLATFORMS,
  XPS_PRODUCTION_STAGE_LABELS,
  XPS_ROOM_PATH_LABELS,
  XPS_ROOM_PATHS,
  XPS_SUBSYSTEM_NAME,
  XPS_SUBSYSTEM_VERSION,
} from './constants';

export function ensureStudioProductionSystemSubsystem() {
  const store = ensureStudioProductionSystemStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('studio-production-system', 'implemented');
  }
  return store;
}

export function getStudioProductionSystemReadyView(input?: import('./types').XpsRuntimeInput) {
  ensureStudioProductionSystemSubsystem();
  return buildStudioProductionSystemReadyView(input);
}

export {
  XPS_SUBSYSTEM_NAME,
  XPS_SUBSYSTEM_VERSION,
  XPS_ROOM_PATHS,
  XPS_ROOM_PATH_LABELS,
  XPS_DEMO_BRAND_IDS,
  XPS_DEMO_BRAND_LABELS,
  XPS_PLATFORMS,
  XPS_PLATFORM_LABELS,
  XPS_DEPARTMENT_LABELS,
  XPS_PRODUCTION_STAGE_LABELS,
  XPS_CONSUMER_SYSTEMS,
  isValidXpsRoomPath,
  xpsRoomPathFromSlug,
  readStudioProductionSystemStore,
  mutateStudioProductionSystemStore,
  seedStudioProductionSystemStore,
  ensureStudioProductionSystemStore,
  recordStudioProductionSystemOpened,
  updateProductionPlaygroundSelection,
  buildStudioProductionSystemReadyView,
  coordinateProduction,
  listProductionPackages,
  getProductionPackage,
  saveProductionPackage,
  evaluatePackageProductionGate,
  assignProductionDepartments,
  listAllDepartmentIds,
  evaluateCreativeExecutiveFit,
  evaluateShowrunnerContinuity,
  buildDefaultApprovalGates,
  approveGate,
  submitPackageForApproval,
  authorizeAssetGeneration,
  canGenerateAssets,
  evaluateApprovalGate,
  buildProductionTimeline,
  advanceTimelineStage,
  getActiveTimelineEvent,
  buildAssetChecklist,
  markAssetReady,
  countAssetsByStatus,
  buildPublishingPlan,
  markPublishingReady,
  buildProductionPlaygroundPreview,
  getLastProductionPreview,
  listProductionConsumerBindings,
};

export type {
  XpsStore,
  XpsReadyView,
  XpsProductionPackage,
  XpsDepartmentAssignment,
  XpsApprovalRecord,
  XpsBlockingIssue,
  XpsTimelineEvent,
  XpsTrackedAsset,
  XpsPublishingStatus,
  XpsPlaygroundPreview,
  XpsPlaygroundInput,
  XpsControlRoomProduction,
  XpsRuntimeInput,
} from './types';

export type {
  XpsRoomPath,
  XpsDemoBrandId,
  XpsPlatform,
  XpsDepartmentId,
  XpsProductionStage,
  XpsConsumerSystem,
  XpsApprovalGateId,
} from './constants';
