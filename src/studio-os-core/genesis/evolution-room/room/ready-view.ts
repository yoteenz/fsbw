import {
  ER_MEETING_STAGES,
  ER_ROOM_PATH_LABELS,
  type ErRoomPath,
} from '../constants';
import { buildExecutiveEvolutionBrief } from '../brief/brief-engine';
import { buildFounderTimeline } from '../founder-timeline/timeline-engine';
import {
  buildEvolutionLaunchStackProgress,
  computeLaunchStackProgressPercent,
} from '../launch-stack/launch-stack-engine';
import { buildGenesisProposalQueue, countQueuedGenesisProposals } from '../genesis-queue/proposal-queue-engine';
import { listLegacyTimeline } from '../legacy-wall/legacy-engine';
import { listFutureOpportunities } from '../future-wall/future-engine';
import { listAutomationSuggestions } from '../automation/automation-engine';
import { listStrategicPriorities } from '../priorities/priorities-engine';
import { buildEvolutionCouncilAgenda } from '../council/council-engine';
import { ensureActiveSession, getActiveSession, roomPathFromSlug } from '../session/meeting-flow-engine';
import { listArchivedSessions } from '../session/session-archive-engine';
import { readEvolutionRoomStore } from '../persistence';
import type { ErPlatformStats, ErReadyView, ErRuntimeInput } from '../types';

function monthLabel(): string {
  return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function getEvolutionRoomPlatformStats(): ErPlatformStats {
  const store = readEvolutionRoomStore();
  return {
    sessionCount: store.sessions.length,
    archivedSessionCount: store.archivedSessions.length,
    legacyEntryCount: listLegacyTimeline().length,
    futureOpportunityCount: listFutureOpportunities().length,
    queuedGenesisProposals: countQueuedGenesisProposals(),
    launchStackProgressPercent: computeLaunchStackProgressPercent(),
    strategicPriorityCount: listStrategicPriorities().length,
    automationSuggestionCount: listAutomationSuggestions().length,
    currentMonthLabel: monthLabel(),
  };
}

export function buildEvolutionRoomReadyView(
  input: ErRuntimeInput = {}
): ErReadyView {
  const activeRoom = roomPathFromSlug(input.pathname?.split('/').pop());
  const founderName = input.founderDisplayName ?? 'Founder';
  const session = ensureActiveSession(founderName);
  const brief = session.brief ?? buildExecutiveEvolutionBrief(founderName);

  return {
    activeRoom,
    activeSession: getActiveSession(),
    stats: getEvolutionRoomPlatformStats(),
    brief,
    founderTimeline: buildFounderTimeline(),
    launchStackProgress: buildEvolutionLaunchStackProgress(),
    genesisProposalQueue: buildGenesisProposalQueue(),
    legacyTimeline: listLegacyTimeline(),
    futureOpportunities: listFutureOpportunities(),
    automationSuggestions: listAutomationSuggestions(),
    strategicPriorities: listStrategicPriorities(),
    councilAgenda: session.councilAgenda.length ? session.councilAgenda : buildEvolutionCouncilAgenda(),
    meetingStages: [...ER_MEETING_STAGES],
    archivedSessions: listArchivedSessions(),
  };
}

export function isValidErRoomPath(path: string): path is ErRoomPath {
  return path in ER_ROOM_PATH_LABELS;
}

export { ER_ROOM_PATH_LABELS };
