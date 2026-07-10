import type { ExpertCaptureSession } from '../types';
import type {
  ExpertCaptureDraftState,
  ExpertCapturePersistedDocument,
  ExpertCaptureRecoveryStatus,
  ExpertCaptureRuntimeState,
  ExpertCaptureSessionIndexes,
  ExpertCaptureWorkflowStage,
} from './types';

function newMutationId(): string {
  return `mut-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function computeProgressPercent(session: ExpertCaptureSession): number {
  const total = session.questions.length || 1;
  const completed = session.answers.filter(
    (a) => !a.deleted && (a.confirmation || a.skipped || a.status === 'approved')
  ).length;
  return Math.min(100, Math.round((completed / total) * 100));
}

export function buildSessionIndexes(session: ExpertCaptureSession): ExpertCaptureSessionIndexes {
  const active = session.answers.filter((a) => !a.deleted);
  return {
    completedQuestionIds: active
      .filter((a) => a.confirmation === 'correct' || a.status === 'approved')
      .map((a) => a.questionId),
    skippedQuestionIds: active.filter((a) => a.skipped).map((a) => a.questionId),
    deletedQuestionIds: session.answers.filter((a) => a.deleted).map((a) => a.questionId),
    redoQuestionIds: active.filter((a) => a.status === 'corrected' || a.transcriptExpertCorrected).map((a) => a.id),
    approvedAnswerIds: active.filter((a) => a.status === 'approved').map((a) => a.id),
    unreviewedAnswerIds: active
      .filter((a) => !a.skipped && a.status !== 'approved' && a.status !== 'deleted' && a.confirmation)
      .map((a) => a.id),
    pendingFollowUps: [],
    completedRecordingIds: active
      .filter((a) => a.media.videoBlobId || a.media.audioBlobId)
      .map((a) => a.id),
  };
}

export function deriveRecoveryStatus(
  runtime: Pick<ExpertCaptureRuntimeState, 'workflowStage' | 'currentAnswer' | 'interruptedAnswer' | 'phase'>,
  session: ExpertCaptureSession
): ExpertCaptureRecoveryStatus {
  if (session.meta.status === 'deleted') return 'deleted';
  if (session.meta.status === 'completed') {
    return runtime.phase === 'export' ? 'exported' : 'complete';
  }
  if (runtime.interruptedAnswer) return 'interrupted';
  if (runtime.phase === 'clarify') return 'awaiting_clarification';
  if (runtime.phase === 'understanding_review') return 'awaiting_review';
  if (runtime.currentAnswer?.status === 'transcribed') return 'awaiting_transcript';
  if (session.meta.status === 'paused') return 'paused';
  if (session.meta.consentAcceptedAt && session.meta.startedAt) return 'in_progress';
  if (session.meta.consentAcceptedAt) return 'ready_to_resume';
  return 'draft';
}

export function buildEmptyRuntime(phase: ExpertCaptureRuntimeState['phase'] = 'landing'): ExpertCaptureRuntimeState {
  return {
    workflowStage: phase,
    currentAnswer: null,
    pendingFollowUp: null,
    liveTranscript: '',
    clarifyDraft: '',
    aiMessage: '',
    currentReviewAnswerId: null,
    interruptedAnswer: null,
    phase,
  };
}

export function buildPersistedDocument(input: {
  session: ExpertCaptureSession;
  runtime: ExpertCaptureRuntimeState;
  sessionVersion?: number;
  lastMutationId?: string;
  guestSessionId?: string | null;
  resumeToken?: string | null;
  activeDeviceId?: string | null;
  deviceMetadata?: ExpertCapturePersistedDocument['deviceMetadata'];
  mediaRefs?: ExpertCapturePersistedDocument['mediaRefs'];
  drafts?: Partial<ExpertCaptureDraftState>;
}): ExpertCapturePersistedDocument {
  const indexes = buildSessionIndexes(input.session);
  if (input.runtime.pendingFollowUp) {
    indexes.pendingFollowUps = [input.runtime.pendingFollowUp];
  }
  const recoveryStatus = deriveRecoveryStatus(input.runtime, input.session);

  return {
    schemaVersion: 2,
    session: {
      ...input.session,
      meta: {
        ...input.session.meta,
        estimatedMinutesRemaining: input.session.meta.estimatedMinutesRemaining,
      },
    },
    runtime: input.runtime,
    indexes,
    drafts: {
      currentDraftTranscript:
        input.drafts?.currentDraftTranscript ??
        input.runtime.liveTranscript ??
        input.runtime.currentAnswer?.transcript ??
        '',
      currentDraftInterpretation:
        input.drafts?.currentDraftInterpretation ?? input.runtime.currentAnswer?.aiUnderstanding ?? null,
      currentDraftKnowledgeObjects:
        input.drafts?.currentDraftKnowledgeObjects ?? input.runtime.currentAnswer?.knowledgeItems ?? [],
    },
    mediaRefs: input.mediaRefs ?? {},
    deviceMetadata: input.deviceMetadata ?? {
      deviceId: 'unknown',
      userAgent: '',
      platform: '',
      language: 'en',
      lastSeenAt: new Date().toISOString(),
    },
    exportStatus: input.session.meta.status === 'completed' ? 'draft' : 'none',
    sessionSummaryStatus: input.session.summary ? 'draft' : 'none',
    consentStatus: input.session.meta.consentAcceptedAt ? 'accepted' : 'pending',
    retentionStatus: 'active',
    recoveryStatus,
    sessionVersion: input.sessionVersion ?? 1,
    lastMutationId: input.lastMutationId ?? newMutationId(),
    guestSessionId: input.guestSessionId ?? null,
    resumeToken: input.resumeToken ?? null,
    activeDeviceId: input.activeDeviceId ?? null,
  };
}

export function resolveResumePhase(doc: ExpertCapturePersistedDocument): ExpertCaptureRuntimeState {
  const { runtime, session } = doc;

  if (runtime.interruptedAnswer) {
    return { ...runtime, workflowStage: 'interrupted_recovery', phase: 'interview' };
  }

  const stage = runtime.workflowStage as ExpertCaptureWorkflowStage;

  if (stage === 'save_exit' || stage === 'welcome_back' || stage === 'session_dashboard') {
    return runtime;
  }

  if (runtime.currentAnswer && runtime.phase === 'understanding_review') {
    return runtime;
  }
  if (runtime.currentAnswer && runtime.phase === 'clarify') {
    return runtime;
  }

  if (session.meta.status === 'completed') {
    if (runtime.phase === 'export' || runtime.phase === 'knowledge_review') return runtime;
    return { ...runtime, phase: 'session_complete', workflowStage: 'session_complete' };
  }

  if (session.meta.consentAcceptedAt && !session.meta.startedAt && runtime.phase === 'media_setup') {
    return runtime;
  }

  if (session.meta.startedAt) {
    return { ...runtime, phase: runtime.phase === 'landing' ? 'interview' : runtime.phase };
  }

  if (session.meta.consentAcceptedAt) {
    return { ...runtime, phase: 'media_setup', workflowStage: 'media_setup' };
  }

  return runtime;
}

export function getLastCompletedSection(session: ExpertCaptureSession): string | null {
  const answered = session.answers.filter((a) => !a.deleted && !a.skipped && (a.transcript || a.confirmation));
  if (!answered.length) return null;
  const last = answered[answered.length - 1];
  const q = session.questions.find((item) => item.id === last.questionId);
  return q?.category ?? null;
}

export function getCurrentQuestionLabel(session: ExpertCaptureSession, pendingFollowUp: string | null): string | null {
  if (pendingFollowUp) return pendingFollowUp;
  const activeIds = new Set(session.answers.filter((a) => !a.deleted).map((a) => a.questionId));
  const next = session.questions.find((q) => !activeIds.has(q.id));
  return next?.text ?? null;
}

export { newMutationId };
