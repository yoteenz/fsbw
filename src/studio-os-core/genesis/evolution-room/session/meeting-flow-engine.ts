import {
  ER_MEETING_STAGES,
  type ErMeetingStage,
  type ErRoomPath,
} from '../constants';
import { buildExecutiveEvolutionBrief } from '../brief/brief-engine';
import { buildEvolutionCouncilAgenda } from '../council/council-engine';
import { mutateEvolutionRoomStore, readEvolutionRoomStore } from '../persistence';
import type {
  ErActionItem,
  ErEvolutionSession,
  ErFounderDecision,
  ErKnowledgeUpdate,
  ErMissionRecommendation,
  ErSessionOutputs,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function monthLabel(): string {
  return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function getActiveSession(): ErEvolutionSession | null {
  const store = readEvolutionRoomStore();
  if (!store.activeSessionId) return null;
  return store.sessions.find((s) => s.sessionId === store.activeSessionId) ?? null;
}

export function startEvolutionSession(founderDisplayName = 'Founder'): ErEvolutionSession {
  const brief = buildExecutiveEvolutionBrief(founderDisplayName);
  const councilAgenda = buildEvolutionCouncilAgenda();

  const session: ErEvolutionSession = {
    sessionId: id('session'),
    monthLabel: monthLabel(),
    status: 'in-progress',
    currentStage: 'arrival',
    startedAt: now(),
    brief,
    councilAgenda,
    founderDecisions: [],
    orbPresentationMode: true,
  };

  mutateEvolutionRoomStore((s) => ({
    ...s,
    sessions: [session, ...s.sessions.filter((x) => x.status !== 'in-progress')],
    activeSessionId: session.sessionId,
  }));

  return session;
}

export function ensureActiveSession(founderDisplayName = 'Founder'): ErEvolutionSession {
  const existing = getActiveSession();
  if (existing) return existing;
  return startEvolutionSession(founderDisplayName);
}

export function advanceMeetingStage(sessionId: string): ErMeetingStage | null {
  let nextStage: ErMeetingStage | null = null;

  mutateEvolutionRoomStore((s) => {
    const sessions = s.sessions.map((session) => {
      if (session.sessionId !== sessionId) return session;
      const idx = ER_MEETING_STAGES.indexOf(session.currentStage);
      if (idx < 0 || idx >= ER_MEETING_STAGES.length - 1) return session;
      nextStage = ER_MEETING_STAGES[idx + 1];
      return { ...session, currentStage: nextStage };
    });
    return { ...s, sessions };
  });

  return nextStage;
}

export function setMeetingStage(sessionId: string, stage: ErMeetingStage): void {
  mutateEvolutionRoomStore((s) => ({
    ...s,
    sessions: s.sessions.map((session) =>
      session.sessionId === sessionId ? { ...session, currentStage: stage } : session
    ),
  }));
}

export function recordFounderDecision(
  sessionId: string,
  decision: Omit<ErFounderDecision, 'decisionId' | 'status' | 'decidedAt'> & {
    status?: ErFounderDecision['status'];
  }
): ErFounderDecision {
  const full: ErFounderDecision = {
    ...decision,
    decisionId: id('decision'),
    status: decision.status ?? 'accepted',
    decidedAt: now(),
  };

  mutateEvolutionRoomStore((s) => ({
    ...s,
    sessions: s.sessions.map((session) =>
      session.sessionId === sessionId
        ? { ...session, founderDecisions: [...session.founderDecisions, full] }
        : session
    ),
  }));

  return full;
}

export function updateCouncilItemInSession(
  sessionId: string,
  agendaId: string,
  status: ErEvolutionSession['councilAgenda'][0]['status'],
  founderNotes?: string
): void {
  mutateEvolutionRoomStore((s) => ({
    ...s,
    sessions: s.sessions.map((session) =>
      session.sessionId === sessionId
        ? {
            ...session,
            councilAgenda: session.councilAgenda.map((item) =>
              item.agendaId === agendaId ? { ...item, status, founderNotes } : item
            ),
          }
        : session
    ),
  }));
}

function buildSessionOutputs(session: ErEvolutionSession): ErSessionOutputs {
  const brief = session.brief;
  const decisions = session.founderDecisions;

  const actionItems: ErActionItem[] = [
    {
      actionId: id('action'),
      title: 'Review Genesis proposal queue',
      owner: 'founder',
      dueHint: 'This week',
      source: 'Genesis Opportunities',
      completed: false,
    },
    {
      actionId: id('action'),
      title: 'Carry accepted decisions into next-month briefings',
      owner: 'orb',
      dueHint: 'Ongoing',
      source: 'Meeting Summary',
      completed: false,
    },
    ...decisions.map((d) => ({
      actionId: id('action'),
      title: d.nextAction,
      owner: 'founder' as const,
      dueHint: d.reviewDate ?? 'Next Evolution session',
      source: d.title,
      completed: false,
    })),
  ];

  const knowledgeUpdates: ErKnowledgeUpdate[] = (brief?.sections ?? [])
    .filter((s) => s.title.includes('Knowledge'))
    .map((s) => ({
      updateId: id('knowledge'),
      title: s.title,
      kind: 'brain-growth' as const,
      summary: s.interpretation,
      suggestedAction: s.recommendation,
    }));

  const missionRecommendations: ErMissionRecommendation[] = session.councilAgenda
    .filter((a) => a.status === 'accepted' || a.status === 'pending')
    .slice(0, 3)
    .map((a) => ({
      recommendationId: id('mission'),
      title: a.topic,
      missionTheme: 'Evolution Council',
      rationale: a.recommendation,
      confidence: 0.75,
    }));

  return {
    executiveSummary:
      brief?.executiveSummary ??
      'Evolution session completed. Decisions archived for next-month continuity.',
    actionItems,
    genesisImprovementProposals: session.councilAgenda
      .filter((a) => a.topic.toLowerCase().includes('genesis') || a.recommendation.includes('canon'))
      .map((a) => a.topic),
    missionRecommendations,
    knowledgeUpdates,
    futureLaunchStackSuggestions: session.councilAgenda
      .filter((a) => a.topic.toLowerCase().includes('launch'))
      .map((a) => a.recommendation),
  };
}

export function generateMeetingSummary(sessionId: string): ErSessionOutputs {
  let outputs: ErSessionOutputs | null = null;

  mutateEvolutionRoomStore((s) => {
    const sessions = s.sessions.map((session) => {
      if (session.sessionId !== sessionId) return session;
      outputs = buildSessionOutputs(session);
      return { ...session, outputs, currentStage: 'meeting-summary' as ErMeetingStage };
    });
    return { ...s, sessions };
  });

  return outputs ?? buildSessionOutputs(ensureActiveSession());
}

export function roomPathFromSlug(slug: string | undefined): ErRoomPath {
  const normalized = slug?.replace(/^\//, '') ?? 'evolution-room';
  const valid: ErRoomPath[] = [
    'evolution-room',
    'executive-review',
    'evolution-brief',
    'genesis-proposals',
    'legacy-wall',
    'future-wall',
    'evolution-council',
    'monthly-review',
  ];
  return valid.includes(normalized as ErRoomPath) ? (normalized as ErRoomPath) : 'evolution-room';
}

