/** Expert Capture — durable persistence model (v2) */

import type {
  ExpertCaptureAnswer,
  ExpertCapturePhase,
  ExpertCaptureSession,
  StructuredKnowledgeItem,
} from '../types';

export type ExpertCaptureRecoveryStatus =
  | 'draft'
  | 'in_progress'
  | 'paused'
  | 'interrupted'
  | 'awaiting_transcript'
  | 'awaiting_review'
  | 'awaiting_clarification'
  | 'ready_to_resume'
  | 'complete'
  | 'exported'
  | 'archived'
  | 'deleted';

export type ExpertCaptureWorkflowStage =
  | ExpertCapturePhase
  | 'welcome_back'
  | 'save_exit'
  | 'interrupted_recovery'
  | 'session_dashboard'
  | 'device_conflict';

export type ExpertCaptureSaveStatus =
  | 'idle'
  | 'saving'
  | 'saved'
  | 'failed'
  | 'offline_pending'
  | 'uploading';

export type ExpertCaptureMediaRef = {
  mediaId: string;
  answerId: string;
  questionId: string;
  localBlobId: string | null;
  storagePath: string | null;
  checksumSha256: string | null;
  uploadStatus: 'none' | 'pending' | 'uploading' | 'uploaded' | 'failed';
  isPartial: boolean;
  byteSize: number | null;
  mimeType: string | null;
};

export type ExpertCaptureInterruptedAnswer = {
  answerId: string;
  questionId: string;
  questionText: string;
  partialTranscript: string;
  partialMediaLocalId: string | null;
  partialMediaId: string | null;
  interruptedAt: string;
  uploadStatus: 'none' | 'pending' | 'uploaded' | 'failed';
};

export type ExpertCaptureRuntimeState = {
  workflowStage: ExpertCaptureWorkflowStage;
  currentAnswer: ExpertCaptureAnswer | null;
  pendingFollowUp: string | null;
  liveTranscript: string;
  clarifyDraft: string;
  aiMessage: string;
  currentReviewAnswerId: string | null;
  interruptedAnswer: ExpertCaptureInterruptedAnswer | null;
  phase: ExpertCapturePhase;
};

export type ExpertCaptureSessionIndexes = {
  completedQuestionIds: string[];
  skippedQuestionIds: string[];
  deletedQuestionIds: string[];
  redoQuestionIds: string[];
  approvedAnswerIds: string[];
  unreviewedAnswerIds: string[];
  pendingFollowUps: string[];
  completedRecordingIds: string[];
};

export type ExpertCaptureDraftState = {
  currentDraftTranscript: string;
  currentDraftInterpretation: string | null;
  currentDraftKnowledgeObjects: StructuredKnowledgeItem[];
};

export type ExpertCaptureDeviceMetadata = {
  deviceId: string;
  userAgent: string;
  platform: string;
  language: string;
  lastSeenAt: string;
};

export type ExpertCapturePersistedDocument = {
  schemaVersion: 2;
  session: ExpertCaptureSession;
  runtime: ExpertCaptureRuntimeState;
  indexes: ExpertCaptureSessionIndexes;
  drafts: ExpertCaptureDraftState;
  mediaRefs: Record<string, ExpertCaptureMediaRef>;
  deviceMetadata: ExpertCaptureDeviceMetadata;
  exportStatus: 'none' | 'draft' | 'complete';
  sessionSummaryStatus: 'none' | 'draft' | 'complete';
  consentStatus: 'pending' | 'accepted' | 'withdrawn';
  retentionStatus: 'active' | 'abandoned_warning' | 'scheduled_delete';
  recoveryStatus: ExpertCaptureRecoveryStatus;
  sessionVersion: number;
  lastMutationId: string;
  resumeToken?: string | null;
  guestSessionId?: string | null;
  activeDeviceId?: string | null;
};

export type ExpertCaptureSyncResult =
  | {
      ok: true;
      sessionVersion: number;
      lastSavedAt: string;
      resumeToken?: string;
      serverConfirmed: boolean;
    }
  | {
      ok: false;
      conflict: true;
      serverDocument: ExpertCapturePersistedDocument;
      sessionVersion: number;
    }
  | {
      ok: false;
      conflict: false;
      error: string;
      offline?: boolean;
    };

export type ExpertCaptureSessionListItem = {
  sessionId: string;
  profileId: string;
  companyId: string;
  expertName: string;
  organizationLabel: string;
  professionLabel: string;
  status: string;
  recoveryStatus: ExpertCaptureRecoveryStatus;
  progressPercent: number;
  currentSectionId: string | null;
  currentQuestionText: string | null;
  lastSavedAt: string;
  createdAt: string;
  approvedCount: number;
  pendingReviewCount: number;
  skippedCount: number;
};

export const EXPERT_CAPTURE_AUTOSAVE_INTERVAL_MS = 12_000;
export const EXPERT_CAPTURE_RESUME_TOKEN_TTL_DAYS = 90;
export const EXPERT_CAPTURE_GUEST_ID_KEY = 'expertCaptureGuestSessionId_v1';
export const EXPERT_CAPTURE_DEVICE_ID_KEY = 'expertCaptureDeviceId_v1';
export const EXPERT_CAPTURE_RESUME_TOKEN_PREFIX = 'expertCaptureResumeToken_';
