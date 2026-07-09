import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import { ensureEvolutionRoomSubsystem } from '../evolution-room/engine';
import {
  ensureExecutiveReflectionSuiteStore,
  recordExecutiveReflectionSuiteOpened,
  seedExecutiveReflectionSuiteStore,
} from './bootstrap/seed';
import {
  buildExecutiveReflectionReadyView,
  getExecutiveReflectionPlatformStats,
  isValidErsRoomPath,
  ERS_ROOM_PATH_LABELS,
  buildExecutiveReviewSummary,
  roomPathFromSlug as ersRoomPathFromSlug,
} from './room/ready-view';
import {
  buildAllHealthReadings,
  buildWithdrawalTestSummaries,
  buildReplacementTestSummaries,
} from './engines/composite-engine';
import {
  listVictories,
  listLessons,
  listFailureStudies,
  listInnovationIdeas,
  listDelightMoments,
  computeDelightScore,
  recordDelightMoment,
} from './engines/artifact-engine';
import {
  buildFutureScenarios,
  buildOpportunitySignals,
  listBoardroomPackets,
  listDecisionTimeline,
  createBoardroomPacket,
} from './engines/future-opportunity-engine';
import {
  startExecutiveSession,
  getActiveExecutiveSession,
  archiveExecutiveSession,
  buildSessionOutputs,
  buildAnnualSummitCapsule,
  buildQuarterlyRetreatPacket,
  getLatestSummitCapsule,
  getLatestRetreatPacket,
} from './engines/session-engine';
import {
  mutateExecutiveReflectionSuiteStore,
  readExecutiveReflectionSuiteStore,
} from './persistence';
import {
  ERS_SUBSYSTEM_NAME,
  ERS_SUBSYSTEM_VERSION,
  ERS_ROOM_PATHS,
} from './constants';

export function ensureExecutiveReflectionSuiteSubsystem() {
  ensureEvolutionRoomSubsystem();
  const store = ensureExecutiveReflectionSuiteStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('executive-reflection-suite', 'implemented');
  }
  return store;
}

export function getExecutiveReflectionSuiteReadyView(input?: {
  pathname?: string;
  founderDisplayName?: string;
  companyName?: string;
}) {
  ensureExecutiveReflectionSuiteSubsystem();
  recordExecutiveReflectionSuiteOpened();
  return buildExecutiveReflectionReadyView(input);
}

export {
  ERS_SUBSYSTEM_NAME,
  ERS_SUBSYSTEM_VERSION,
  ERS_ROOM_PATHS,
  ERS_ROOM_PATH_LABELS,
  isValidErsRoomPath,
  readExecutiveReflectionSuiteStore,
  mutateExecutiveReflectionSuiteStore,
  seedExecutiveReflectionSuiteStore,
  ensureExecutiveReflectionSuiteStore,
  recordExecutiveReflectionSuiteOpened,
  buildExecutiveReflectionReadyView,
  getExecutiveReflectionPlatformStats,
  buildExecutiveReviewSummary,
  buildAllHealthReadings,
  buildWithdrawalTestSummaries,
  buildReplacementTestSummaries,
  listVictories,
  listLessons,
  listFailureStudies,
  listInnovationIdeas,
  listDelightMoments,
  computeDelightScore,
  recordDelightMoment,
  buildFutureScenarios,
  buildOpportunitySignals,
  listBoardroomPackets,
  listDecisionTimeline,
  createBoardroomPacket,
  startExecutiveSession,
  getActiveExecutiveSession,
  archiveExecutiveSession,
  buildSessionOutputs,
  buildAnnualSummitCapsule,
  buildQuarterlyRetreatPacket,
  getLatestSummitCapsule,
  getLatestRetreatPacket,
  ersRoomPathFromSlug,
};

export type {
  ErsStore,
  ErsReadyView,
  ErsPlatformStats,
  ErsHealthReading,
  ErsVictoryArtifact,
  ErsLessonArtifact,
  ErsFailureStudy,
  ErsInnovationIdea,
  ErsDecisionTimelineEntry,
  ErsBoardroomPacket,
  ErsFutureScenario,
  ErsOpportunitySignal,
  ErsDelightMoment,
  ErsExecutiveSession,
  ErsSessionOutputs,
  ErsSummitCapsule,
  ErsRetreatPacket,
  ErsRuntimeInput,
} from './types';

export type { ErsRoomPath, ErsSessionType, ErsHealthLens } from './constants';
