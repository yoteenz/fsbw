import type { ExpertCaptureProfile } from './profiles/profile-types';
import type {
  ExpertCaptureAnswer,
  ExpertCaptureQuestion,
  ExpertCaptureSession,
  ExpertCaptureSessionMeta,
  StructuredKnowledgeItem,
} from './types';

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptySession(
  input: {
    expertName: string;
    expertRole: string;
    organizationLabel?: string;
  },
  profile: ExpertCaptureProfile
): ExpertCaptureSession {
  const now = new Date().toISOString();
  const meta: ExpertCaptureSessionMeta = {
    id: newId('session'),
    profileId: profile.id,
    expertName: input.expertName.trim() || 'Expert',
    expertRole: profile.lockRole
      ? profile.defaultExpertRole
      : input.expertRole.trim() || profile.defaultExpertRole,
    organizationLabel: profile.lockOrganization
      ? profile.defaultOrganization
      : input.organizationLabel?.trim() || profile.defaultOrganization,
    createdAt: now,
    updatedAt: now,
    consentAcceptedAt: null,
    startedAt: null,
    endedAt: null,
    pausedAt: null,
    status: 'draft',
    currentQuestionIndex: 0,
    estimatedMinutesRemaining: profile.questions.length * profile.minutesPerQuestion,
    aiGreetingDelivered: false,
    trustFramework: null,
    inviteId: null,
    inviteToken: null,
  };
  return {
    meta,
    questions: profile.questions.map((q) => ({ ...q })),
    answers: [],
    summary: null,
  };
}

export function loadSession(profile: ExpertCaptureProfile): ExpertCaptureSession | null {
  try {
    const raw = localStorage.getItem(profile.sessionStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ExpertCaptureSession;
    if (!parsed.meta.profileId) {
      parsed.meta.profileId = profile.id;
    }
    if (parsed.meta.trustFramework === undefined) {
      parsed.meta.trustFramework = null;
    }
    if (parsed.meta.inviteId === undefined) parsed.meta.inviteId = null;
    if (parsed.meta.inviteToken === undefined) parsed.meta.inviteToken = null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: ExpertCaptureSession, profile: ExpertCaptureProfile): void {
  session.meta.updatedAt = new Date().toISOString();
  localStorage.setItem(profile.sessionStorageKey, JSON.stringify(session));
}

export function clearSessionStorage(profile: ExpertCaptureProfile): void {
  localStorage.removeItem(profile.sessionStorageKey);
}

export function getActiveQuestions(session: ExpertCaptureSession): ExpertCaptureQuestion[] {
  const answeredOrSkipped = new Set(
    session.answers.filter((a) => !a.deleted).map((a) => a.questionId)
  );
  return session.questions.filter((q) => !answeredOrSkipped.has(q.id));
}

export function getCurrentQuestion(session: ExpertCaptureSession): ExpertCaptureQuestion | null {
  const active = getActiveQuestions(session);
  if (!active.length) return null;
  const idx = Math.min(session.meta.currentQuestionIndex, active.length - 1);
  return active[idx] ?? null;
}

export function estimateRemainingMinutes(
  session: ExpertCaptureSession,
  minutesPerQuestion = 3
): number {
  const remaining = getActiveQuestions(session).length;
  return Math.max(1, remaining * minutesPerQuestion);
}

export function createAnswerForQuestion(
  _session: ExpertCaptureSession,
  question: ExpertCaptureQuestion,
  followUpOf: string | null = null
): ExpertCaptureAnswer {
  return {
    id: newId('answer'),
    questionId: question.id,
    questionText: question.text,
    followUpOf,
    skipped: false,
    deleted: false,
    deletedAt: null,
    recordedAt: null,
    durationMs: null,
    transcript: '',
    correctedTranscript: null,
    transcriptExpertCorrected: false,
    aiUnderstanding: null,
    confirmation: null,
    clarificationNotes: null,
    knowledgeItems: [],
    media: { videoBlobId: null, audioBlobId: null },
    status: 'recorded',
  };
}

export function newKnowledgeItem(
  answerId: string,
  partial: Omit<StructuredKnowledgeItem, 'id' | 'answerId' | 'status'>
): StructuredKnowledgeItem {
  return {
    id: newId('knowledge'),
    answerId,
    status: 'interpreted',
    ...partial,
  };
}

export function countProgress(session: ExpertCaptureSession): { current: number; total: number } {
  const total = session.questions.length;
  const completed = session.answers.filter((a) => !a.deleted && (a.confirmation || a.skipped)).length;
  return { current: Math.min(completed + 1, total), total };
}
