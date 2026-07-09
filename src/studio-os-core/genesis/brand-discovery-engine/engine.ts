import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import {
  ensureBrandDiscoveryEngineStore,
  recordBrandDiscoveryEngineOpened,
  seedBrandDiscoveryEngineStore,
  updateBrandDiscoveryPlaygroundSelection,
  updateDiscoveryInputs,
  advanceDiscoveryStep,
} from './bootstrap/seed';
import { runDiscoverySynthesis } from './engines/brand-discovery-engine';
import { evaluateBrandIntelligence } from './engines/brand-intelligence-layer';
import { scoreBrandConsistency } from './engines/brand-consistency-checker';
import { generateElevationReport } from './engines/brand-elevation-engine';
import {
  getBrandDnaById,
  listBrandDnaRegistry,
  searchBrandDnaRegistry,
} from './engines/brand-dna-registry';
import { listConsumerBindings, compileExperienceBrandDnaId } from './engines/brand-application-engine';
import { buildPlaygroundAsset } from './engines/brand-playground-engine';
import {
  buildBrandDiscoveryEngineReadyView,
  isValidXbdRoomPath,
  xbdRoomPathFromSlug,
} from './room/ready-view';
import {
  mutateBrandDiscoveryEngineStore,
  readBrandDiscoveryEngineStore,
} from './persistence';
import {
  XBD_CONSUMER_SYSTEMS,
  XBD_DEMO_BRAND_IDS,
  XBD_DEMO_BRAND_LABELS,
  XBD_PLAYGROUND_ASSET_LABELS,
  XBD_PLAYGROUND_ASSET_TYPES,
  XBD_ROOM_PATH_LABELS,
  XBD_ROOM_PATHS,
  XBD_SUBSYSTEM_NAME,
  XBD_SUBSYSTEM_VERSION,
} from './constants';

export function ensureBrandDiscoveryEngineSubsystem() {
  const store = ensureBrandDiscoveryEngineStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('brand-discovery-engine', 'implemented');
  }
  return store;
}

export function getBrandDiscoveryEngineReadyView(input?: import('./types').XbdRuntimeInput) {
  ensureBrandDiscoveryEngineSubsystem();
  return buildBrandDiscoveryEngineReadyView(input);
}

export {
  XBD_SUBSYSTEM_NAME,
  XBD_SUBSYSTEM_VERSION,
  XBD_ROOM_PATHS,
  XBD_ROOM_PATH_LABELS,
  XBD_DEMO_BRAND_IDS,
  XBD_DEMO_BRAND_LABELS,
  XBD_PLAYGROUND_ASSET_TYPES,
  XBD_PLAYGROUND_ASSET_LABELS,
  XBD_CONSUMER_SYSTEMS,
  isValidXbdRoomPath,
  xbdRoomPathFromSlug,
  readBrandDiscoveryEngineStore,
  mutateBrandDiscoveryEngineStore,
  seedBrandDiscoveryEngineStore,
  ensureBrandDiscoveryEngineStore,
  recordBrandDiscoveryEngineOpened,
  updateBrandDiscoveryPlaygroundSelection,
  updateDiscoveryInputs,
  advanceDiscoveryStep,
  runDiscoverySynthesis,
  buildBrandDiscoveryEngineReadyView,
  listBrandDnaRegistry,
  getBrandDnaById,
  searchBrandDnaRegistry,
  evaluateBrandIntelligence,
  scoreBrandConsistency,
  generateElevationReport,
  listConsumerBindings,
  compileExperienceBrandDnaId,
  buildPlaygroundAsset,
};

export type {
  XbdStore,
  XbdReadyView,
  XbdBrandDnaRecord,
  XbdBrandDirections,
  XbdDiscoverySession,
  XbdDiscoveryInput,
  XbdConsistencyScore,
  XbdElevationReport,
  XbdIntelligenceQuery,
  XbdIntelligenceResult,
  XbdPlaygroundAsset,
  XbdPlaygroundSelection,
  XbdRuntimeInput,
} from './types';

export type { XbdRoomPath, XbdDemoBrandId, XbdPlaygroundAssetType, XbdConsumerSystem } from './constants';
