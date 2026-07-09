import { buildExecutiveEvolutionBrief } from '../../evolution-room/brief/brief-engine';
import { buildEvolutionCouncilAgenda } from '../../evolution-room/council/council-engine';
import { listFutureOpportunities } from '../../evolution-room/future-wall/future-engine';
import { listStrategicPriorities } from '../../evolution-room/priorities/priorities-engine';
import { listImprovementProposals } from '../../live-validation-system/genesis-learning/proposal-engine';
import { listDiaryAnswers } from '../../live-validation-system/founder-diary/diary-engine';
import { readExecutiveReflectionSuiteStore, mutateExecutiveReflectionSuiteStore } from '../persistence';
import type {
  ErsExecutiveSession,
  ErsSessionOutputs,
  ErsSummitCapsule,
  ErsRetreatPacket,
} from '../types';
import type { ErsRoomPath, ErsSessionType } from '../constants';

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function now(): string {
  return new Date().toISOString();
}

function quarterLabel(): string {
  const d = new Date();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q} ${d.getFullYear()}`;
}

function yearLabel(): string {
  return String(new Date().getFullYear());
}

export function buildSessionOutputs(
  _sessionType: ErsSessionType,
  founderName = 'Founder'
): ErsSessionOutputs {
  const brief = buildExecutiveEvolutionBrief(founderName);
  const council = buildEvolutionCouncilAgenda();
  const priorities = listStrategicPriorities();
  const proposals = listImprovementProposals();
  const future = listFutureOpportunities();
  const diary = listDiaryAnswers(5);

  return {
    executiveSummary: brief.executiveSummary,
    founderReflections: diary.map((d) => d.response.slice(0, 120)),
    strategicPriorities: priorities.map((p) => p.title),
    missionRecommendations: council.slice(0, 3).map((c) => c.recommendation),
    knowledgeUpdates: brief.sections
      .filter((s) => s.title.toLowerCase().includes('knowledge'))
      .map((s) => s.recommendation),
    genesisImprovementProposals: proposals.slice(0, 5).map((p) => p.title),
    futureOpportunities: future.slice(0, 5).map((f) => f.title),
    decisionLog: council.filter((c) => c.status === 'accepted').map((c) => c.topic),
  };
}

export function startExecutiveSession(
  sessionType: ErsSessionType,
  roomPath: ErsRoomPath,
  founderName = 'Founder'
): ErsExecutiveSession {
  const session: ErsExecutiveSession = {
    sessionId: id('session'),
    sessionType,
    roomPath,
    status: 'in-progress',
    startedAt: now(),
    orbPresentationMode: true,
    outputs: buildSessionOutputs(sessionType, founderName),
  };

  mutateExecutiveReflectionSuiteStore((s) => ({
    ...s,
    sessions: [session, ...s.sessions.filter((x) => x.status !== 'in-progress')],
    activeSessionId: session.sessionId,
  }));

  return session;
}

export function getActiveExecutiveSession(): ErsExecutiveSession | null {
  const store = readExecutiveReflectionSuiteStore();
  if (!store.activeSessionId) return null;
  return store.sessions.find((s) => s.sessionId === store.activeSessionId) ?? null;
}

export function archiveExecutiveSession(sessionId: string): void {
  mutateExecutiveReflectionSuiteStore((s) => {
    const session = s.sessions.find((x) => x.sessionId === sessionId);
    if (!session) return s;
    const archived = {
      ...session,
      status: 'archived' as const,
      completedAt: now(),
      outputs: session.outputs ?? buildSessionOutputs(session.sessionType),
    };
    return {
      ...s,
      sessions: s.sessions.filter((x) => x.sessionId !== sessionId),
      archivedSessions: [archived, ...s.archivedSessions],
      activeSessionId: s.activeSessionId === sessionId ? undefined : s.activeSessionId,
    };
  });
}

export function buildAnnualSummitCapsule(founderName = 'Founder'): ErsSummitCapsule {
  const brief = buildExecutiveEvolutionBrief(founderName);
  const year = yearLabel();

  const capsule: ErsSummitCapsule = {
    capsuleId: id('summit'),
    yearLabel: year,
    originalVision: 'Build Studio OS as the operating environment where founders operate companies with clarity and legacy.',
    yearStory: brief.executiveSummary,
    milestones: brief.sections.slice(0, 4).map((s) => s.headline),
    lessons: ['Reflection is an operating environment, not a report', 'Nothing auto-canonizes'],
    breakthroughs: ['Evolution Room runtime', 'Executive Reflection Suite canon'],
    genesisEvolution: 'Launch Stack governance arc: Build Order through Reflection Suite',
    platformEvolution: 'FAT → Live Validation → Evolution Room → Executive Reflection Suite',
    founderEvolution: `Founder reflection captured through Founder Diary™ and ${founderName}'s monthly Evolution sessions.`,
    futureVision: 'Complete Headquarters reflection wing with Boardroom, Annual Summit, and Victory Gallery.',
    nextChapterInvitation: 'Shall we begin writing the next chapter?',
  };

  mutateExecutiveReflectionSuiteStore((s) => ({
    ...s,
    summitCapsules: [capsule, ...s.summitCapsules.filter((c) => c.yearLabel !== year)],
  }));

  return capsule;
}

export function buildQuarterlyRetreatPacket(): ErsRetreatPacket {
  const quarter = quarterLabel();
  const council = buildEvolutionCouncilAgenda();

  const packet: ErsRetreatPacket = {
    packetId: id('retreat'),
    quarterLabel: quarter,
    strategicTheme: 'Complete Executive Reflection Suite implementation',
    strategicBets: council.slice(0, 3).map((c) => c.topic),
    stoppedItems: ['Dashboard-style reflection UI', 'Auto-canonizing Genesis changes'],
    founderHealthCommitment: 'Schedule one Evolution Room session this month',
    knowledgeGoal: 'Preserve one lesson in Lessons Learned Library',
    generatedAt: now(),
  };

  mutateExecutiveReflectionSuiteStore((s) => ({
    ...s,
    retreatPackets: [packet, ...s.retreatPackets.filter((p) => p.quarterLabel !== quarter)],
  }));

  return packet;
}

export function getLatestSummitCapsule(): ErsSummitCapsule | null {
  const store = readExecutiveReflectionSuiteStore();
  return store.summitCapsules[0] ?? null;
}

export function getLatestRetreatPacket(): ErsRetreatPacket | null {
  const store = readExecutiveReflectionSuiteStore();
  return store.retreatPackets[0] ?? null;
}
