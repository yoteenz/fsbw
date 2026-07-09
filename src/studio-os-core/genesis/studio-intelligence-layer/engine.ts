import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import {
  ensureStudioIntelligenceLayerStore,
  recordStudioIntelligenceLayerOpened,
  seedStudioIntelligenceLayerStore,
  updateIntelligencePlaygroundSelection,
} from './bootstrap/seed';
import { reviewCanonCandidate, proposeCanonCandidate, classifyInformation } from './engines/canon-engine';
import { compileExperienceEnvironment } from './engines/experience-compiler';
import { evaluateExecutiveIntelligence } from './engines/executive-intelligence-engine';
import { learnTasteFromFeedback, scoreTasteFit } from './engines/taste-learning-engine';
import { buildDecisionRecommendation, scoreDecisionAlignment } from './engines/decision-intelligence-engine';
import { buildManualConsultationChecklist } from './engines/operating-manual-engine';
import { listIntelligenceConsumerBindings } from './engines/intelligence-consumer-engine';
import {
  buildStudioIntelligenceLayerReadyView,
  isValidXsilRoomPath,
  xsilRoomPathFromSlug,
} from './room/ready-view';
import {
  mutateStudioIntelligenceLayerStore,
  readStudioIntelligenceLayerStore,
} from './persistence';
import {
  XSIL_CONSUMER_SYSTEMS,
  XSIL_DEMO_COMPANY_IDS,
  XSIL_DEMO_COMPANY_LABELS,
  XSIL_FOUNDATION_TRAITS,
  XSIL_ROOM_PATH_LABELS,
  XSIL_ROOM_PATHS,
  XSIL_SUBSYSTEM_NAME,
  XSIL_SUBSYSTEM_VERSION,
} from './constants';
import {
  getCompanyById,
  listCompanyRegistry,
  searchIntelligenceRegistry,
} from './registries/intelligence-registries';

export function ensureStudioIntelligenceLayerSubsystem() {
  const store = ensureStudioIntelligenceLayerStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('studio-intelligence-layer', 'implemented');
  }
  return store;
}

export function getStudioIntelligenceLayerReadyView(input?: import('./types').XsilRuntimeInput) {
  ensureStudioIntelligenceLayerSubsystem();
  return buildStudioIntelligenceLayerReadyView(input);
}

export {
  XSIL_SUBSYSTEM_NAME,
  XSIL_SUBSYSTEM_VERSION,
  XSIL_ROOM_PATHS,
  XSIL_ROOM_PATH_LABELS,
  XSIL_DEMO_COMPANY_IDS,
  XSIL_DEMO_COMPANY_LABELS,
  XSIL_CONSUMER_SYSTEMS,
  XSIL_FOUNDATION_TRAITS,
  isValidXsilRoomPath,
  xsilRoomPathFromSlug,
  readStudioIntelligenceLayerStore,
  mutateStudioIntelligenceLayerStore,
  seedStudioIntelligenceLayerStore,
  ensureStudioIntelligenceLayerStore,
  recordStudioIntelligenceLayerOpened,
  updateIntelligencePlaygroundSelection,
  buildStudioIntelligenceLayerReadyView,
  listCompanyRegistry,
  getCompanyById,
  searchIntelligenceRegistry,
  evaluateExecutiveIntelligence,
  compileExperienceEnvironment,
  buildManualConsultationChecklist,
  buildDecisionRecommendation,
  scoreDecisionAlignment,
  learnTasteFromFeedback,
  scoreTasteFit,
  proposeCanonCandidate,
  reviewCanonCandidate,
  classifyInformation,
  listIntelligenceConsumerBindings,
};

export type {
  XsilStore,
  XsilReadyView,
  XsilCompanyRecord,
  XsilOperatingManualRecord,
  XsilDecisionDnaRecord,
  XsilTasteGenomeRecord,
  XsilAudienceDnaRecord,
  XsilProductDnaRecord,
  XsilCreativeNode,
  XsilCanonCandidate,
  XsilExperienceCompileManifest,
  XsilExecutiveRecommendation,
  XsilPlaygroundSelection,
  XsilRuntimeInput,
  XsilIntelligenceQuery,
} from './types';

export type { XsilRoomPath, XsilDemoCompanyId, XsilConsumerSystem, XsilCanonClass } from './constants';
