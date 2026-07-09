import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import { ensureLiveValidationSystemSubsystem } from '../live-validation-system/engine';
import {
  ensureEvolutionRoomStore,
  recordEvolutionRoomOpened,
  seedEvolutionRoomStore,
} from './bootstrap/seed';
import { buildExecutiveEvolutionBrief } from './brief/brief-engine';
import { buildFounderTimeline } from './founder-timeline/timeline-engine';
import {
  buildEvolutionLaunchStackProgress,
  computeLaunchStackProgressPercent,
} from './launch-stack/launch-stack-engine';
import {
  buildGenesisProposalQueue,
  countQueuedGenesisProposals,
} from './genesis-queue/proposal-queue-engine';
import { listLegacyTimeline, preserveLegacyEntry } from './legacy-wall/legacy-engine';
import { listFutureOpportunities, addFutureOpportunity } from './future-wall/future-engine';
import { listAutomationSuggestions } from './automation/automation-engine';
import {
  listStrategicPriorities,
  updateStrategicPriorityStatus,
  addStrategicPriority,
} from './priorities/priorities-engine';
import { buildEvolutionCouncilAgenda } from './council/council-engine';
import {
  ensureActiveSession,
  getActiveSession,
  startEvolutionSession,
  advanceMeetingStage,
  setMeetingStage,
  recordFounderDecision,
  updateCouncilItemInSession,
  generateMeetingSummary,
  roomPathFromSlug,
} from './session/meeting-flow-engine';
import { archiveEvolutionSession, listArchivedSessions } from './session/session-archive-engine';
import {
  buildEvolutionRoomReadyView,
  getEvolutionRoomPlatformStats,
  isValidErRoomPath,
  ER_ROOM_PATH_LABELS,
} from './room/ready-view';
import {
  mutateEvolutionRoomStore,
  readEvolutionRoomStore,
} from './persistence';
import {
  ER_SUBSYSTEM_NAME,
  ER_SUBSYSTEM_VERSION,
  ER_MEETING_STAGES,
  ER_MEETING_STAGE_LABELS,
  ER_ROOM_PATHS,
} from './constants';

export function ensureEvolutionRoomSubsystem() {
  ensureLiveValidationSystemSubsystem();
  const store = ensureEvolutionRoomStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('evolution-room', 'implemented');
  }
  return store;
}

export function getEvolutionRoomReadyView(input?: {
  pathname?: string;
  founderDisplayName?: string;
  companyName?: string;
}) {
  ensureEvolutionRoomSubsystem();
  recordEvolutionRoomOpened();
  return buildEvolutionRoomReadyView(input);
}

export {
  ER_SUBSYSTEM_NAME,
  ER_SUBSYSTEM_VERSION,
  ER_MEETING_STAGES,
  ER_MEETING_STAGE_LABELS,
  ER_ROOM_PATHS,
  ER_ROOM_PATH_LABELS,
  isValidErRoomPath,
  readEvolutionRoomStore,
  mutateEvolutionRoomStore,
  seedEvolutionRoomStore,
  ensureEvolutionRoomStore,
  recordEvolutionRoomOpened,
  buildEvolutionRoomReadyView,
  getEvolutionRoomPlatformStats,
  buildExecutiveEvolutionBrief,
  buildFounderTimeline,
  buildEvolutionLaunchStackProgress,
  computeLaunchStackProgressPercent,
  buildGenesisProposalQueue,
  countQueuedGenesisProposals,
  listLegacyTimeline,
  preserveLegacyEntry,
  listFutureOpportunities,
  addFutureOpportunity,
  listAutomationSuggestions,
  listStrategicPriorities,
  updateStrategicPriorityStatus,
  addStrategicPriority,
  buildEvolutionCouncilAgenda,
  ensureActiveSession,
  getActiveSession,
  startEvolutionSession,
  advanceMeetingStage,
  setMeetingStage,
  recordFounderDecision,
  updateCouncilItemInSession,
  generateMeetingSummary,
  archiveEvolutionSession,
  listArchivedSessions,
  roomPathFromSlug,
};

export type {
  ErStore,
  ErReadyView,
  ErPlatformStats,
  ErExecutiveEvolutionBrief,
  ErBriefSection,
  ErFounderTimelineEntry,
  ErLaunchStackProgressItem,
  ErGenesisProposalQueueItem,
  ErLegacyTimelineEntry,
  ErFutureOpportunity,
  ErAutomationSuggestion,
  ErStrategicPriority,
  ErCouncilAgendaItem,
  ErFounderDecision,
  ErEvolutionSession,
  ErArchivedSession,
  ErSessionOutputs,
  ErActionItem,
  ErKnowledgeUpdate,
  ErMissionRecommendation,
  ErRuntimeInput,
} from './types';

export type { ErMeetingStage, ErRoomPath } from './constants';
