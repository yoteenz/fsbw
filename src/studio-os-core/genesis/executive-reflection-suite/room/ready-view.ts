import { ERS_ROOM_PATH_LABELS, type ErsRoomPath } from '../constants';
import {
  buildAllHealthReadings,
  buildExecutiveReviewSummary,
  buildWithdrawalTestSummaries,
  buildReplacementTestSummaries,
  listFounderDiaryPrompts,
  listFounderDiaryAnswers,
  listEscapeVelocityPatterns,
  listGenesisImprovementProposals,
  buildEvolutionLaunchStackProgress,
  buildExecutiveEvolutionBrief,
  buildFounderTimeline,
  listLegacyTimeline,
  buildEvolutionCouncilAgenda,
  computeLaunchStackProgressPercent,
} from '../engines/composite-engine';
import {
  listVictories,
  listLessons,
  listFailureStudies,
  listInnovationIdeas,
  listDelightMoments,
  computeDelightScore,
} from '../engines/artifact-engine';
import {
  buildFutureScenarios,
  buildOpportunitySignals,
  listBoardroomPackets,
  listDecisionTimeline,
} from '../engines/future-opportunity-engine';
import {
  getActiveExecutiveSession,
  getLatestSummitCapsule,
  getLatestRetreatPacket,
} from '../engines/session-engine';
import { readExecutiveReflectionSuiteStore } from '../persistence';
import type { ErsPlatformStats, ErsReadyView, ErsRuntimeInput, ErsHealthReading } from '../types';

export function getExecutiveReflectionPlatformStats(): ErsPlatformStats {
  const store = readExecutiveReflectionSuiteStore();
  const health = buildAllHealthReadings();
  const executive = health.find((h: ErsHealthReading) => h.lens === 'executive');

  return {
    sessionCount: store.sessions.length + store.archivedSessions.length,
    victoryCount: listVictories().length,
    lessonCount: listLessons().length,
    opportunityCount: buildOpportunitySignals().length,
    boardroomPacketCount: listBoardroomPackets().length,
    executiveHealthScore: executive?.score ?? 0,
    delightScore: computeDelightScore(),
    launchStackHealth: computeLaunchStackProgressPercent(),
  };
}

export function roomPathFromSlug(slug: string | undefined): ErsRoomPath {
  const normalized = slug?.replace(/^\//, '') ?? 'executive-reflection';
  const valid = Object.keys(ERS_ROOM_PATH_LABELS) as ErsRoomPath[];
  return valid.includes(normalized as ErsRoomPath)
    ? (normalized as ErsRoomPath)
    : 'executive-reflection';
}

export function buildExecutiveReflectionReadyView(
  input: ErsRuntimeInput = {}
): ErsReadyView {
  const founderName = input.founderDisplayName ?? 'Founder';
  const activeRoom = roomPathFromSlug(input.pathname?.split('/').pop());

  return {
    activeRoom,
    activeSession: getActiveExecutiveSession(),
    stats: getExecutiveReflectionPlatformStats(),
    healthReadings: buildAllHealthReadings(),
    victories: listVictories(),
    lessons: listLessons(),
    failureStudies: listFailureStudies(),
    innovationIdeas: listInnovationIdeas(),
    decisionTimeline: listDecisionTimeline(),
    boardroomPackets: listBoardroomPackets(),
    futureScenarios: buildFutureScenarios(),
    opportunitySignals: buildOpportunitySignals(),
    delightMoments: listDelightMoments(),
    summitCapsule: getLatestSummitCapsule(),
    retreatPacket: getLatestRetreatPacket(),
    founderDiaryPrompts: listFounderDiaryPrompts(12),
    founderDiaryAnswers: listFounderDiaryAnswers(12),
    escapePatterns: listEscapeVelocityPatterns(),
    genesisProposals: listGenesisImprovementProposals(),
    launchStackProgress: buildEvolutionLaunchStackProgress(),
    founderTimeline: buildFounderTimeline(),
    legacyTimeline: listLegacyTimeline(),
    councilAgenda: buildEvolutionCouncilAgenda(),
    evolutionBrief: buildExecutiveEvolutionBrief(founderName),
    withdrawalTests: buildWithdrawalTestSummaries(),
    replacementTests: buildReplacementTestSummaries(),
  };
}

export function isValidErsRoomPath(path: string): path is ErsRoomPath {
  return path in ERS_ROOM_PATH_LABELS;
}

export { ERS_ROOM_PATH_LABELS, buildExecutiveReviewSummary };
