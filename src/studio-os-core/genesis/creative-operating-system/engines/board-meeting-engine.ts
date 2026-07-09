import { getNarrativeBlueprint } from '../../narrative-intelligence/engines/narrative-blueprint-generator';
import { getProductionGenomeForBrand } from '../../narrative-intelligence/engines/production-genome-registry';
import type { XpsProductionPackage } from '../../studio-production-system/types';
import { mutateCreativeOperatingSystemStore, readCreativeOperatingSystemStore, setCreativeOrgState } from '../persistence';
import type { XcosFounderDecision } from '../constants';
import type { XcosBoardMeeting, XcosBoardMeetingInput } from '../types';
import { buildCouncilSessionFromInput } from './creative-council';
import { archiveBoardMeetingToMemory } from './creative-memory-engine';

/** Board Meeting™ — auto-convene Executive Creative Board for major productions */
export function autoConveneBoardMeetingForProduction(pkg: XpsProductionPackage): XcosBoardMeeting {
  const input: XcosBoardMeetingInput = {
    packageId: pkg.packageId,
    blueprintId: pkg.blueprintId,
    brandId: pkg.brandId,
    topic: pkg.topic,
    goal: pkg.goal,
    audience: pkg.audience,
    platform: pkg.platform,
  };

  const session = buildCouncilSessionFromInput(input);
  const now = new Date().toISOString();
  const meeting: XcosBoardMeeting = {
    ...session,
    meetingId: `board-${pkg.packageId}`,
    createdAt: now,
    updatedAt: now,
  };

  mutateCreativeOperatingSystemStore((store) => {
    const filtered = store.boardMeetings.filter((m) => m.meetingId !== meeting.meetingId);
    return {
      ...store,
      orgState: 'council-convened',
      boardMeetings: [meeting, ...filtered],
    };
  });

  setCreativeOrgState('founder-decision-pending');
  return meeting;
}

export function getBoardMeeting(meetingId: string): XcosBoardMeeting | undefined {
  return readCreativeOperatingSystemStore().boardMeetings.find((m) => m.meetingId === meetingId);
}

export function getBoardMeetingForPackage(packageId: string): XcosBoardMeeting | undefined {
  return readCreativeOperatingSystemStore().boardMeetings.find((m) => m.packageId === packageId);
}

export function listBoardMeetings(): XcosBoardMeeting[] {
  return readCreativeOperatingSystemStore().boardMeetings;
}

export function recordFounderBoardDecision(
  meetingId: string,
  decision: XcosFounderDecision,
  rationale?: string
): XcosBoardMeeting | undefined {
  const now = new Date().toISOString();
  let updated: XcosBoardMeeting | undefined;

  mutateCreativeOperatingSystemStore((store) => {
    const idx = store.boardMeetings.findIndex((m) => m.meetingId === meetingId);
    if (idx < 0) return store;

    updated = {
      ...store.boardMeetings[idx],
      founderDecision: decision,
      founderRationale: rationale,
      decidedAt: now,
      updatedAt: now,
    };

    const meetings = [...store.boardMeetings];
    meetings[idx] = updated;

    const orgState =
      decision === 'approved'
        ? 'production-authorized'
        : decision === 'hold' || decision === 'revision'
          ? 'founder-decision-pending'
          : 'listening';

    return { ...store, boardMeetings: meetings, orgState };
  });

  if (updated && !updated.archivedToMemory) {
    archiveBoardMeetingToMemory(updated);
    mutateCreativeOperatingSystemStore((store) => ({
      ...store,
      boardMeetings: store.boardMeetings.map((m) =>
        m.meetingId === meetingId ? { ...m, archivedToMemory: true } : m
      ),
    }));
  }

  return updated;
}

export function buildMeetingProductionContext(meeting: XcosBoardMeeting): {
  blueprintSummary?: string;
  genomeId?: string;
} {
  const blueprint = getNarrativeBlueprint(meeting.blueprintId);
  const genome = getProductionGenomeForBrand(meeting.brandId);
  return {
    blueprintSummary: blueprint ? `${blueprint.narrativeType}: ${blueprint.topic}` : undefined,
    genomeId: genome?.genomeId,
  };
}
