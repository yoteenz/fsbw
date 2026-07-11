import { InviteApiError } from './invite-store';
import { getOwnerAuthToken } from './owner-password';

export type OwnerCaptureMediaItem = {
  id: string;
  answerId: string;
  questionId: string | null;
  mimeType: string | null;
  byteSize: number | null;
  uploadStatus: string;
  isPartial: boolean;
  uploadedAt: string | null;
  storagePath: string;
  playbackUrl: string | null;
};

export type OwnerCaptureAnswerItem = {
  id: string;
  questionId: string;
  questionText: string;
  transcript: string;
  correctedTranscript: string | null;
  aiUnderstanding: string | null;
  clarificationNotes: string | null;
  status: string;
  recordedAt: string | null;
  skipped: boolean;
  deleted: boolean;
  durationMs: number | null;
  media: OwnerCaptureMediaItem[];
};

export type OwnerInviteCaptureReview = {
  ok: boolean;
  code?: string;
  error?: string;
  invite?: {
    id: string;
    token?: string;
    inviteeName: string;
    businessName?: string;
    role?: string;
    workerBeingCreated?: string;
    profileId?: string;
    sessionId?: string;
    progressPercent: number;
    currentQuestionLabel?: string | null;
    knowledgeExtractedCount?: number;
    lastActiveAt?: string | null;
    status?: string;
  };
  session?: {
    id: string;
    status: string;
    expertName: string;
    progressPercent: number;
    lastSavedAt: string | null;
    recoveryStatus: string | null;
    answerCount: number;
    recordedCount: number;
    approvedCount: number;
    answers: OwnerCaptureAnswerItem[];
  };
};

function apiBase(): string {
  return (import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '') as string;
}

export async function fetchOwnerInviteCaptureReview(inviteId: string): Promise<OwnerInviteCaptureReview> {
  const auth = getOwnerAuthToken();
  if (!auth) {
    throw new InviteApiError('Unlock Invite Manager to view captured work', 'auth');
  }
  const res = await fetch(
    `${apiBase()}/api/studio-institute/invite-capture?inviteId=${encodeURIComponent(inviteId)}`,
    { headers: { 'X-Studio-Institute-Owner-Key': auth } }
  );
  if (res.status === 401 || res.status === 403) {
    throw new InviteApiError('Owner access required', 'auth', res.status);
  }
  const data = (await res.json().catch(() => ({}))) as OwnerInviteCaptureReview & { error?: string };
  if (!res.ok) {
    throw new InviteApiError(data.error ?? `Request failed (${res.status})`, 'server', res.status);
  }
  return data;
}

export function buildOwnerCaptureExportBundle(review: OwnerInviteCaptureReview): Record<string, unknown> {
  const exportedAt = new Date().toISOString();
  return {
    schemaVersion: 'studio-institute-owner-capture-export-v1',
    exportedAt,
    invite: review.invite ?? null,
    session: review.session
      ? {
          id: review.session.id,
          status: review.session.status,
          expertName: review.session.expertName,
          progressPercent: review.session.progressPercent,
          lastSavedAt: review.session.lastSavedAt,
          recoveryStatus: review.session.recoveryStatus,
          answerCount: review.session.answerCount,
          recordedCount: review.session.recordedCount,
          approvedCount: review.session.approvedCount,
          answers: review.session.answers.map((a) => ({
            id: a.id,
            questionId: a.questionId,
            questionText: a.questionText,
            transcript: a.transcript,
            correctedTranscript: a.correctedTranscript,
            aiUnderstanding: a.aiUnderstanding,
            clarificationNotes: a.clarificationNotes,
            status: a.status,
            recordedAt: a.recordedAt,
            skipped: a.skipped,
            durationMs: a.durationMs,
            media: a.media.map((m) => ({
              id: m.id,
              mimeType: m.mimeType,
              byteSize: m.byteSize,
              uploadStatus: m.uploadStatus,
              isPartial: m.isPartial,
              uploadedAt: m.uploadedAt,
              storagePath: m.storagePath,
              playbackUrl: m.playbackUrl,
            })),
          })),
        }
      : null,
  };
}

export function downloadOwnerCaptureExport(review: OwnerInviteCaptureReview, filenameBase: string): void {
  const bundle = buildOwnerCaptureExportBundle(review);
  const safeName = filenameBase.replace(/[^a-zA-Z0-9-_]+/g, '_').slice(0, 64) || 'invite-capture';
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeName}-capture-export.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
