import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import {
  ensureNarrativeIntelligenceStore,
  recordNarrativeIntelligenceOpened,
  seedNarrativeIntelligenceStore,
  updateNarrativePlaygroundSelection,
} from './bootstrap/seed';
import {
  approveNarrativeBlueprint,
  generateNarrativeBlueprint,
  getNarrativeBlueprint,
  listNarrativeBlueprints,
  rejectNarrativeBlueprint,
  saveNarrativeBlueprint,
  submitBlueprintForApproval,
} from './engines/narrative-blueprint-generator';
import { listProductionGenomes, getProductionGenomeForBrand } from './engines/production-genome-registry';
import { evaluateProductionGate, canProduceAssets } from './engines/production-gate';
import { generateEpisodeStructure } from './engines/episode-generator';
import { generateCampaignStructure } from './engines/campaign-generator';
import { generateCourseStructure } from './engines/course-generator';
import { generateLaunchStructure } from './engines/launch-generator';
import { generateCommercialStructure } from './engines/commercial-generator';
import {
  buildHeadquartersEnvironment,
  buildSceneFlow,
  reasonAboutNarrative,
} from './engines/narrative-intelligence-engine';
import {
  buildNarrativePlaygroundPreview,
  getLastPlaygroundPreview,
} from './engines/narrative-playground-engine';
import {
  listNarrativeConsumerBindings,
  getNarrativeConsumerLabel,
} from './engines/narrative-consumer-engine';
import {
  buildNarrativeIntelligenceReadyView,
  isValidXniRoomPath,
  xniRoomPathFromSlug,
} from './room/ready-view';
import {
  mutateNarrativeIntelligenceStore,
  readNarrativeIntelligenceStore,
} from './persistence';
import {
  XNI_CONSUMER_SYSTEMS,
  XNI_DEMO_BRAND_IDS,
  XNI_DEMO_BRAND_LABELS,
  XNI_NARRATIVE_TYPES,
  XNI_NARRATIVE_TYPE_LABELS,
  XNI_ROOM_PATH_LABELS,
  XNI_ROOM_PATHS,
  XNI_SUBSYSTEM_NAME,
  XNI_SUBSYSTEM_VERSION,
} from './constants';

export function ensureNarrativeIntelligenceSubsystem() {
  const store = ensureNarrativeIntelligenceStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('narrative-intelligence', 'implemented');
  }
  return store;
}

export function getNarrativeIntelligenceReadyView(input?: import('./types').XniRuntimeInput) {
  ensureNarrativeIntelligenceSubsystem();
  return buildNarrativeIntelligenceReadyView(input);
}

export {
  XNI_SUBSYSTEM_NAME,
  XNI_SUBSYSTEM_VERSION,
  XNI_ROOM_PATHS,
  XNI_ROOM_PATH_LABELS,
  XNI_DEMO_BRAND_IDS,
  XNI_DEMO_BRAND_LABELS,
  XNI_NARRATIVE_TYPES,
  XNI_NARRATIVE_TYPE_LABELS,
  XNI_CONSUMER_SYSTEMS,
  isValidXniRoomPath,
  xniRoomPathFromSlug,
  readNarrativeIntelligenceStore,
  mutateNarrativeIntelligenceStore,
  seedNarrativeIntelligenceStore,
  ensureNarrativeIntelligenceStore,
  recordNarrativeIntelligenceOpened,
  updateNarrativePlaygroundSelection,
  buildNarrativeIntelligenceReadyView,
  listProductionGenomes,
  getProductionGenomeForBrand,
  generateNarrativeBlueprint,
  listNarrativeBlueprints,
  getNarrativeBlueprint,
  saveNarrativeBlueprint,
  submitBlueprintForApproval,
  approveNarrativeBlueprint,
  rejectNarrativeBlueprint,
  evaluateProductionGate,
  canProduceAssets,
  generateEpisodeStructure,
  generateCampaignStructure,
  generateCourseStructure,
  generateLaunchStructure,
  generateCommercialStructure,
  reasonAboutNarrative,
  buildSceneFlow,
  buildHeadquartersEnvironment,
  buildNarrativePlaygroundPreview,
  getLastPlaygroundPreview,
  listNarrativeConsumerBindings,
  getNarrativeConsumerLabel,
};

export type {
  XniStore,
  XniReadyView,
  XniNarrativeBlueprint,
  XniProductionGenome,
  XniEpisodeStructure,
  XniSceneFlow,
  XniHeadquartersEnvironment,
  XniPlaygroundPreview,
  XniPlaygroundInput,
  XniRuntimeInput,
  XniSceneSpec,
} from './types';

export type { XniRoomPath, XniDemoBrandId, XniNarrativeType, XniConsumerSystem, XniBlueprintStatus } from './constants';

export type { XniCampaignStructure } from './engines/campaign-generator';
export type { XniCourseStructure } from './engines/course-generator';
export type { XniLaunchStructure } from './engines/launch-generator';
export type { XniCommercialStructure } from './engines/commercial-generator';
