import { BASE_INTERVIEW_QUESTIONS, EXPERT_CAPTURE_SESSION_KEY } from './constants';
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

export function createEmptySession(input: {
  expertName: string;
  expertRole: string;
  organizationLabel?: string;
}): ExpertCaptureSession {
  const now = new Date().toISOString();
  const meta: ExpertCaptureSessionMeta = {
    id: newId('session'),
    expertName: input.expertName.trim() || 'Expert',
    expertRole: input.expertRole.trim() || 'Professional',
    organizationLabel: input.organizationLabel?.trim() || 'Studio OS',
    createdAt: now,
    updatedAt: now,
    consentAcceptedAt: null,
    startedAt: null,
    endedAt: null,
    pausedAt: null,
    status: 'draft',
    currentQuestionIndex: 0,
    estimatedMinutesRemaining: BASE_INTERVIEW_QUESTIONS.length * 3,
    aiGreetingDelivered: false,
  };
  return {
    meta,
    questions: BASE_INTERVIEW_QUESTIONS.map((q) => ({ ...q })),
    answers: [],
    summary: null,
  };
}

export function loadSession(): ExpertCaptureSession | null {
  try {
    const raw = localStorage.getItem(EXPERT_CAPTURE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ExpertCaptureSession;
  } catch {
    return null;
  }
}

export function saveSession(session: ExpertCaptureSession): void {
  session.meta.updatedAt = new Date().toISOString();
  localStorage.setItem(EXPERT_CAPTURE_SESSION_KEY, JSON.stringify(session));
}

export function clearSessionStorage(): void {
  localStorage.removeItem(EXPERT_CAPTURE_SESSION_KEY);
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

export function estimateRemainingMinutes(session: ExpertCaptureSession): number {
  const remaining = getActiveQuestions(session).length;
  return Math.max(1, remaining * 3);
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
