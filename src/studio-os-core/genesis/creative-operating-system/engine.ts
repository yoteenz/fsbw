import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import {
  ensureCreativeOperatingSystemStore,
  recordCreativeOperatingSystemOpened,
  seedCreativeOperatingSystemStore,
} from './bootstrap/seed';
import {
  autoConveneBoardMeetingForProduction,
  getBoardMeeting,
  getBoardMeetingForPackage,
  listBoardMeetings,
  recordFounderBoardDecision,
} from './engines/board-meeting-engine';
import {
  buildExecutiveBriefs,
  getExecutiveStatusForPackage,
  listBoardExecutives,
} from './engines/executive-creative-board';
import {
  buildCouncilAgenda,
  buildCouncilEvidence,
  buildCouncilRisks,
  buildCouncilTradeOffs,
  buildExpectedOutcomes,
  synthesizeCouncilRecommendation,
} from './engines/creative-council';
import {
  archiveBoardMeetingToMemory,
  listCreativeMemory,
  recordProductionToMemory,
  recordLessonLearned,
  searchCreativeMemory,
} from './engines/creative-memory-engine';
import {
  approveEvolutionProposal,
  getEvolutionRecommendationsByTarget,
  listEvolutionProposals,
  runPostPublicationEvolution,
} from './engines/creative-evolution-engine';
import {
  countEconomyAssets,
  getEconomyAssetsByType,
  listEconomyAssets,
  promoteEconomyAsset,
  registerEconomyAsset,
  registerEconomyAssetsFromProduction,
} from './engines/creative-economy-registry';
import {
  evaluateCreativeGovernance,
  hasGovernanceViolations,
  listGovernanceRecords,
} from './engines/creative-governance-engine';
import { listCreativeConsumerBindings } from './engines/creative-consumer-engine';
import {
  buildCreativeOperatingSystemControlRoomOverlay,
  buildCreativeOperatingSystemReadyView,
  isValidXcosRoomPath,
  xcosRoomPathFromSlug,
} from './room/ready-view';
import {
  mutateCreativeOperatingSystemStore,
  readCreativeOperatingSystemStore,
} from './persistence';
import {
  XCOS_CONSUMER_SYSTEMS,
  XCOS_DEMO_BRAND_IDS,
  XCOS_DEMO_BRAND_LABELS,
  XCOS_EXECUTIVE_LABELS,
  XCOS_ORG_STATE_LABELS,
  XCOS_ROOM_PATH_LABELS,
  XCOS_ROOM_PATHS,
  XCOS_SUBSYSTEM_NAME,
  XCOS_SUBSYSTEM_VERSION,
} from './constants';

export function ensureCreativeOperatingSystemSubsystem() {
  const store = ensureCreativeOperatingSystemStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('creative-operating-system', 'implemented');
  }
  return store;
}

export function getCreativeOperatingSystemReadyView(input?: import('./types').XcosRuntimeInput) {
  ensureCreativeOperatingSystemSubsystem();
  return buildCreativeOperatingSystemReadyView(input);
}

export {
  XCOS_SUBSYSTEM_NAME,
  XCOS_SUBSYSTEM_VERSION,
  XCOS_ROOM_PATHS,
  XCOS_ROOM_PATH_LABELS,
  XCOS_DEMO_BRAND_IDS,
  XCOS_DEMO_BRAND_LABELS,
  XCOS_EXECUTIVE_LABELS,
  XCOS_ORG_STATE_LABELS,
  XCOS_CONSUMER_SYSTEMS,
  isValidXcosRoomPath,
  xcosRoomPathFromSlug,
  readCreativeOperatingSystemStore,
  mutateCreativeOperatingSystemStore,
  seedCreativeOperatingSystemStore,
  ensureCreativeOperatingSystemStore,
  recordCreativeOperatingSystemOpened,
  buildCreativeOperatingSystemReadyView,
  buildCreativeOperatingSystemControlRoomOverlay,
  autoConveneBoardMeetingForProduction,
  getBoardMeeting,
  getBoardMeetingForPackage,
  listBoardMeetings,
  recordFounderBoardDecision,
  buildExecutiveBriefs,
  listBoardExecutives,
  getExecutiveStatusForPackage,
  buildCouncilAgenda,
  synthesizeCouncilRecommendation,
  buildCouncilTradeOffs,
  buildCouncilEvidence,
  buildCouncilRisks,
  buildExpectedOutcomes,
  archiveBoardMeetingToMemory,
  listCreativeMemory,
  searchCreativeMemory,
  recordProductionToMemory,
  recordLessonLearned,
  runPostPublicationEvolution,
  listEvolutionProposals,
  approveEvolutionProposal,
  getEvolutionRecommendationsByTarget,
  listEconomyAssets,
  registerEconomyAsset,
  registerEconomyAssetsFromProduction,
  promoteEconomyAsset,
  countEconomyAssets,
  getEconomyAssetsByType,
  evaluateCreativeGovernance,
  listGovernanceRecords,
  hasGovernanceViolations,
  listCreativeConsumerBindings,
};

export type {
  XcosStore,
  XcosReadyView,
  XcosBoardMeeting,
  XcosExecutiveBrief,
  XcosCreativeMemoryRecord,
  XcosEvolutionProposal,
  XcosEconomyAsset,
  XcosGovernanceRecord,
  XcosControlRoomOverlay,
  XcosRuntimeInput,
} from './types';

export type {
  XcosRoomPath,
  XcosDemoBrandId,
  XcosExecutiveId,
  XcosOrgState,
  XcosMemoryType,
  XcosFounderDecision,
  XcosEconomyAssetType,
  XcosEvolutionTarget,
  XcosConsumerSystem,
} from './constants';
