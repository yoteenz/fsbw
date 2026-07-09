import { preserveLegacyEntry } from '../legacy-wall/legacy-engine';
import { addFutureOpportunity } from '../future-wall/future-engine';
import { mutateEvolutionRoomStore, readEvolutionRoomStore } from '../persistence';
import { generateMeetingSummary } from './meeting-flow-engine';
import type { ErArchivedSession, ErEvolutionSession } from '../types';

function now(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function archiveEvolutionSession(sessionId: string): ErArchivedSession | null {
  const store = readEvolutionRoomStore();
  const session = store.sessions.find((s) => s.sessionId === sessionId);
  if (!session) return null;

  const outputs = session.outputs ?? generateMeetingSummary(sessionId);

  let legacyAdded = 0;
  if (session.founderDecisions.some((d) => d.status === 'accepted')) {
    preserveLegacyEntry({
      title: `${session.monthLabel} Evolution Session`,
      category: 'milestone',
      narrative: outputs.executiveSummary.slice(0, 280),
      sessionId,
    });
    legacyAdded = 1;
  }

  for (const mission of outputs.missionRecommendations.slice(0, 1)) {
    addFutureOpportunity({
      title: mission.title,
      category: 'mission',
      description: mission.rationale,
      evidence: [`From ${session.monthLabel} Evolution session`],
      confidence: mission.confidence,
      priority: 'medium',
    });
  }

  const archive: ErArchivedSession = {
    archiveId: id('archive'),
    sessionId,
    monthLabel: session.monthLabel,
    sealedAt: now(),
    executiveSummary: outputs.executiveSummary,
    decisionCount: session.founderDecisions.length,
    legacyEntriesAdded: legacyAdded,
    futureItemsAdded: outputs.missionRecommendations.length > 0 ? 1 : 0,
  };

  mutateEvolutionRoomStore((s) => ({
    ...s,
    sessions: s.sessions.map((sess) =>
      sess.sessionId === sessionId
        ? ({
            ...sess,
            status: 'archived',
            completedAt: sess.completedAt ?? now(),
            archivedAt: now(),
            outputs,
            currentStage: 'archive-session',
          } as ErEvolutionSession)
        : sess
    ),
    archivedSessions: [archive, ...s.archivedSessions],
    activeSessionId: s.activeSessionId === sessionId ? undefined : s.activeSessionId,
  }));

  return archive;
}

export function listArchivedSessions(): ErArchivedSession[] {
  return readEvolutionRoomStore().archivedSessions;
}
