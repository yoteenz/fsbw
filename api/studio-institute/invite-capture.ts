/**
 * GET /api/studio-institute/invite-capture?inviteId=...
 * Owner-only: load expert capture session + signed playback URLs for an invite.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from '../_lib/supabase.js';
import { isStudioInstituteOwner } from '../_lib/studioInstituteOwnerAuth.js';
import {
  EXPERT_CAPTURE_MEDIA_BUCKET,
  type ExpertCapturePersistedDocument,
} from '../_lib/expertCapturePersistence.js';

const SIGNED_URL_TTL_SEC = 3600;

type InviteRow = {
  id: string;
  token: string;
  invitee_name: string;
  business_name: string;
  role: string;
  worker_being_created: string;
  profile_id: string;
  session_id: string | null;
  progress_percent: number;
  current_question_label: string | null;
  knowledge_extracted_count: number;
  last_active_at: string | null;
  status: string;
};

type SessionRow = {
  id: string;
  status: string;
  expert_name: string | null;
  progress_percent: number | null;
  last_saved_at: string | null;
  recovery_status: string | null;
  session_document: ExpertCapturePersistedDocument | null;
};

type MediaRow = {
  id: string;
  answer_id: string;
  question_id: string | null;
  storage_path: string;
  mime_type: string | null;
  byte_size: number | null;
  upload_status: string | null;
  is_partial: boolean | null;
  uploaded_at: string | null;
};

type AnswerDoc = {
  id?: string;
  questionId?: string;
  questionText?: string;
  transcript?: string;
  aiUnderstanding?: string | null;
  status?: string;
  recordedAt?: string | null;
  skipped?: boolean;
  deleted?: boolean;
  durationMs?: number | null;
  correctedTranscript?: string | null;
  clarificationNotes?: string | null;
};

function cors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Studio-Institute-Owner-Key');
}

function parseAnswers(document: ExpertCapturePersistedDocument | null): AnswerDoc[] {
  const session = document?.session as { answers?: AnswerDoc[] } | undefined;
  if (!session?.answers || !Array.isArray(session.answers)) return [];
  return session.answers;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!hasSupabaseServiceRole()) {
    return res.status(503).json({ ok: false, code: 'OFFLINE', error: 'Server persistence not configured' });
  }

  if (!(await isStudioInstituteOwner(req))) {
    return res.status(401).json({ ok: false, code: 'AUTH_REQUIRED', error: 'Owner access required' });
  }

  const inviteId = typeof req.query.inviteId === 'string' ? req.query.inviteId.trim() : '';
  if (!inviteId) {
    return res.status(400).json({ ok: false, code: 'MISSING_INVITE', error: 'Missing inviteId' });
  }

  const admin = getSupabaseAdminServiceRole();
  const { data: inviteData, error: inviteError } = await admin
    .from('studio_institute_invites')
    .select(
      'id, token, invitee_name, business_name, role, worker_being_created, profile_id, session_id, progress_percent, current_question_label, knowledge_extracted_count, last_active_at, status'
    )
    .eq('id', inviteId)
    .maybeSingle();

  if (inviteError) return res.status(500).json({ ok: false, error: inviteError.message });
  if (!inviteData) return res.status(404).json({ ok: false, code: 'INVITE_NOT_FOUND', error: 'Invite not found' });

  const invite = inviteData as InviteRow;
  const sessionId = invite.session_id?.trim() || null;

  if (!sessionId) {
    return res.status(200).json({
      ok: false,
      code: 'NO_SESSION',
      error: 'No saved interview session linked to this invite yet.',
      invite: {
        id: invite.id,
        inviteeName: invite.invitee_name,
        businessName: invite.business_name,
        progressPercent: Number(invite.progress_percent ?? 0),
        currentQuestionLabel: invite.current_question_label,
        lastActiveAt: invite.last_active_at,
        status: invite.status,
      },
    });
  }

  const { data: sessionData, error: sessionError } = await admin
    .from('expert_capture_sessions')
    .select('id, status, expert_name, progress_percent, last_saved_at, recovery_status, session_document')
    .eq('id', sessionId)
    .neq('status', 'deleted')
    .maybeSingle();

  if (sessionError) return res.status(500).json({ ok: false, error: sessionError.message });
  if (!sessionData) {
    return res.status(200).json({
      ok: false,
      code: 'SESSION_NOT_FOUND',
      error: 'Interview session not found on server (may not have synced yet).',
      invite: {
        id: invite.id,
        inviteeName: invite.invitee_name,
        sessionId,
        progressPercent: Number(invite.progress_percent ?? 0),
      },
    });
  }

  const sessionRow = sessionData as SessionRow;
  const { data: mediaRows, error: mediaError } = await admin
    .from('expert_capture_media')
    .select('id, answer_id, question_id, storage_path, mime_type, byte_size, upload_status, is_partial, uploaded_at')
    .eq('session_id', sessionId)
    .order('uploaded_at', { ascending: true });

  if (mediaError) return res.status(500).json({ ok: false, error: mediaError.message });

  const mediaByAnswer = new Map<string, MediaRow[]>();
  for (const row of (mediaRows ?? []) as MediaRow[]) {
    const list = mediaByAnswer.get(row.answer_id) ?? [];
    list.push(row);
    mediaByAnswer.set(row.answer_id, list);
  }

  async function signedPlaybackUrl(storagePath: string): Promise<string | null> {
    const { data, error } = await admin.storage
      .from(EXPERT_CAPTURE_MEDIA_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_TTL_SEC);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  }

  const answers = parseAnswers(sessionRow.session_document);
  const visibleAnswers = answers.filter((a) => !a.deleted);
  const answerItems = [];

  for (const answer of visibleAnswers) {
    const answerId = String(answer.id ?? '');
    const mediaList = mediaByAnswer.get(answerId) ?? [];
    const mediaItems = [];

    for (const m of mediaList) {
      const playbackUrl =
        m.upload_status === 'uploaded' && m.storage_path ? await signedPlaybackUrl(m.storage_path) : null;
      mediaItems.push({
        id: m.id,
        answerId: m.answer_id,
        questionId: m.question_id,
        mimeType: m.mime_type,
        byteSize: m.byte_size,
        uploadStatus: m.upload_status ?? 'unknown',
        isPartial: Boolean(m.is_partial),
        uploadedAt: m.uploaded_at,
        storagePath: m.storage_path,
        playbackUrl,
      });
    }

    answerItems.push({
      id: answerId,
      questionId: String(answer.questionId ?? ''),
      questionText: String(answer.questionText ?? ''),
      transcript: String(answer.transcript ?? ''),
      correctedTranscript: answer.correctedTranscript ?? null,
      aiUnderstanding: answer.aiUnderstanding ?? null,
      clarificationNotes: answer.clarificationNotes ?? null,
      status: String(answer.status ?? 'recorded'),
      recordedAt: answer.recordedAt ?? null,
      skipped: Boolean(answer.skipped),
      deleted: Boolean(answer.deleted),
      durationMs: answer.durationMs ?? null,
      media: mediaItems,
    });
  }

  const approvedCount = answerItems.filter((a) => a.status === 'approved').length;
  const recordedCount = answerItems.filter((a) => !a.skipped && (a.transcript || a.media.length > 0)).length;

  return res.status(200).json({
    ok: true,
    invite: {
      id: invite.id,
      token: invite.token,
      inviteeName: invite.invitee_name,
      businessName: invite.business_name,
      role: invite.role,
      workerBeingCreated: invite.worker_being_created,
      profileId: invite.profile_id,
      sessionId,
      progressPercent: Number(invite.progress_percent ?? sessionRow.progress_percent ?? 0),
      currentQuestionLabel: invite.current_question_label,
      knowledgeExtractedCount: invite.knowledge_extracted_count ?? 0,
      lastActiveAt: invite.last_active_at,
      status: invite.status,
    },
    session: {
      id: sessionRow.id,
      status: sessionRow.status,
      expertName: sessionRow.expert_name ?? invite.invitee_name,
      progressPercent: Number(sessionRow.progress_percent ?? invite.progress_percent ?? 0),
      lastSavedAt: sessionRow.last_saved_at,
      recoveryStatus: sessionRow.recovery_status,
      answerCount: answerItems.length,
      recordedCount,
      approvedCount,
      answers: answerItems,
    },
  });
}
