import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from './supabase.js';

export const EXPERT_CAPTURE_MEDIA_BUCKET = 'expert-capture-media';
export const EXPERT_CAPTURE_RESUME_TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export type ExpertCapturePersistedDocument = Record<string, unknown> & {
  schemaVersion?: number;
  sessionVersion?: number;
  lastMutationId?: string;
  session?: { meta?: { id?: string; profileId?: string; expertName?: string } };
  recoveryStatus?: string;
};

export function hashResumeToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateResumeToken(): string {
  return randomBytes(32).toString('base64url');
}

export function verifyResumeToken(token: string, hash: string | null): boolean {
  if (!token || !hash) return false;
  const given = Buffer.from(hashResumeToken(token), 'hex');
  const expected = Buffer.from(hash, 'hex');
  if (given.length !== expected.length) return false;
  return timingSafeEqual(given, expected);
}

export async function ensureExpertCaptureMediaBucket(): Promise<void> {
  if (!hasSupabaseServiceRole()) return;
  const admin = getSupabaseAdminServiceRole();
  const { data: existing } = await admin.storage.getBucket(EXPERT_CAPTURE_MEDIA_BUCKET);
  if (existing) return;
  await admin.storage.createBucket(EXPERT_CAPTURE_MEDIA_BUCKET, {
    public: false,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ['video/webm', 'audio/webm', 'video/mp4', 'audio/mp4'],
  });
}

export async function writeExpertCaptureAudit(
  sessionId: string,
  eventType: string,
  payload: Record<string, unknown> = {}
): Promise<void> {
  if (!hasSupabaseServiceRole()) return;
  try {
    const admin = getSupabaseAdminServiceRole();
    await admin.from('expert_capture_audit').insert({
      session_id: sessionId,
      event_type: eventType,
      payload,
    });
  } catch {
    /* best effort */
  }
}

export function extractSessionRowFields(doc: ExpertCapturePersistedDocument) {
  const session = doc.session as {
    meta?: {
      id?: string;
      profileId?: string;
      expertName?: string;
      expertRole?: string;
      organizationLabel?: string;
      currentQuestionIndex?: number;
      status?: string;
      consentAcceptedAt?: string | null;
    };
    questions?: Array<{ id: string; category: string; text: string }>;
    answers?: unknown[];
    summary?: unknown;
  };
  const meta = session.meta ?? {};
  const questions = session.questions ?? [];
  const currentQ = questions[meta.currentQuestionIndex ?? 0];
  const progress =
    typeof (doc as { progressPercent?: number }).progressPercent === 'number'
      ? (doc as { progressPercent: number }).progressPercent
      : computeProgressFromDoc(doc);

  return {
    id: meta.id ?? '',
    profile_id: meta.profileId ?? 'generic-v1',
    expert_name: meta.expertName ?? 'Expert',
    expert_role: meta.expertRole ?? 'Professional',
    organization_label: meta.organizationLabel ?? 'Studio OS',
    current_section_id: currentQ?.category ?? null,
    current_question_id: currentQ?.id ?? null,
    current_question_index: meta.currentQuestionIndex ?? 0,
    progress_percent: progress,
    status: meta.status ?? 'draft',
    recovery_status: doc.recoveryStatus ?? 'draft',
    consent_status: (doc as { consentStatus?: string }).consentStatus ?? 'pending',
    export_status: (doc as { exportStatus?: string }).exportStatus ?? 'none',
    session_summary_status: (doc as { sessionSummaryStatus?: string }).sessionSummaryStatus ?? 'none',
    current_workflow_stage: (doc as { runtime?: { workflowStage?: string } }).runtime?.workflowStage ?? 'landing',
  };
}

function computeProgressFromDoc(doc: ExpertCapturePersistedDocument): number {
  const session = doc.session as {
    questions?: unknown[];
    answers?: Array<{ deleted?: boolean; confirmation?: unknown; skipped?: boolean; status?: string }>;
  };
  const total = session.questions?.length ?? 1;
  const completed =
    session.answers?.filter((a) => !a.deleted && (a.confirmation || a.skipped || a.status === 'approved')).length ?? 0;
  return Math.min(100, Math.round((completed / total) * 100));
}
