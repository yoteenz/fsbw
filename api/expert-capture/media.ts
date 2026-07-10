import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'crypto';
import { getAuthUser } from '../_lib/auth.js';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from '../_lib/supabase.js';
import {
  ensureExpertCaptureMediaBucket,
  EXPERT_CAPTURE_MEDIA_BUCKET,
  hashResumeToken,
  writeExpertCaptureAudit,
} from '../_lib/expertCapturePersistence.js';

function parseBody(req: VercelRequest): Record<string, unknown> {
  const body = req.body;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (body && typeof body === 'object' && !Array.isArray(body)) return body as Record<string, unknown>;
  return {};
}

function cors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Expert-Capture-Resume-Token, X-Guest-Session-Id');
}

async function authorizeSession(
  sessionId: string,
  resumeToken: string | null,
  guestSessionId: string | null
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!hasSupabaseServiceRole()) return { ok: false, status: 503, error: 'Server persistence not configured' };
  const admin = getSupabaseAdminServiceRole();
  const { data, error } = await admin.from('expert_capture_sessions').select('guest_session_id, resume_token_hash, status').eq('id', sessionId).maybeSingle();
  if (error || !data) return { ok: false, status: 404, error: 'Session not found' };
  if (data.status === 'deleted') return { ok: false, status: 410, error: 'Session deleted' };
  if (resumeToken && data.resume_token_hash === hashResumeToken(resumeToken)) return { ok: true };
  if (guestSessionId && data.guest_session_id === guestSessionId) return { ok: true };
  return { ok: false, status: 403, error: 'Unauthorized' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await getAuthUser(req);
  const body = parseBody(req);
  const action = typeof body.action === 'string' ? body.action : 'upload';
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
  const answerId = typeof body.answerId === 'string' ? body.answerId : '';
  const questionId = typeof body.questionId === 'string' ? body.questionId : '';
  const mediaId = typeof body.mediaId === 'string' ? body.mediaId : '';
  const resumeToken =
    typeof body.resumeToken === 'string'
      ? body.resumeToken
      : typeof req.headers['x-expert-capture-resume-token'] === 'string'
        ? req.headers['x-expert-capture-resume-token']
        : null;
  const guestSessionId =
    typeof body.guestSessionId === 'string'
      ? body.guestSessionId
      : typeof req.headers['x-guest-session-id'] === 'string'
        ? req.headers['x-guest-session-id']
        : null;

  if (!sessionId || !answerId || !mediaId) {
    return res.status(400).json({ error: 'Missing sessionId, answerId, or mediaId' });
  }

  const auth = await authorizeSession(sessionId, resumeToken, guestSessionId);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  if (action === 'prepare') {
    if (!hasSupabaseServiceRole()) return res.status(503).json({ error: 'Server persistence not configured' });
    await ensureExpertCaptureMediaBucket();
    const admin = getSupabaseAdminServiceRole();
    const storagePath = `${sessionId}/${answerId}/${mediaId}.webm`;
    const { data, error } = await admin.storage.from(EXPERT_CAPTURE_MEDIA_BUCKET).createSignedUploadUrl(storagePath);
    if (error) return res.status(500).json({ error: error.message });

    await admin.from('expert_capture_media').upsert({
      id: mediaId,
      session_id: sessionId,
      answer_id: answerId,
      question_id: questionId,
      storage_path: storagePath,
      upload_status: 'pending',
      is_partial: body.isPartial === true,
      mime_type: typeof body.mimeType === 'string' ? body.mimeType : 'video/webm',
    });

    return res.status(200).json({
      signedUrl: data.signedUrl,
      storagePath,
      token: data.token,
    });
  }

  if (action === 'confirm') {
    const checksum = typeof body.checksumSha256 === 'string' ? body.checksumSha256 : null;
    const byteSize = typeof body.byteSize === 'number' ? body.byteSize : null;
    if (!hasSupabaseServiceRole()) return res.status(503).json({ error: 'Server persistence not configured' });
    const admin = getSupabaseAdminServiceRole();
    const storagePath = typeof body.storagePath === 'string' ? body.storagePath : `${sessionId}/${answerId}/${mediaId}.webm`;

    await admin
      .from('expert_capture_media')
      .update({
        upload_status: 'uploaded',
        checksum_sha256: checksum,
        byte_size: byteSize,
        uploaded_at: new Date().toISOString(),
        is_partial: body.isPartial === true,
      })
      .eq('id', mediaId);

    await writeExpertCaptureAudit(sessionId, 'answer.media_uploaded', { answerId, mediaId, isPartial: body.isPartial === true });
    return res.status(200).json({ ok: true, serverConfirmed: true });
  }

  if (action === 'upload') {
    const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';
    const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl);
    if (!match) return res.status(400).json({ error: 'Invalid dataUrl' });
    const mime = match[1].toLowerCase();
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.byteLength > 12 * 1024 * 1024) {
      return res.status(400).json({ error: 'Media must be <= 12MB for direct upload' });
    }

    await ensureExpertCaptureMediaBucket();
    const admin = getSupabaseAdminServiceRole();
    const storagePath = `${sessionId}/${answerId}/${mediaId}.webm`;
    const checksum = createHash('sha256').update(bytes).digest('hex');

    const { error: uploadError } = await admin.storage.from(EXPERT_CAPTURE_MEDIA_BUCKET).upload(storagePath, bytes, {
      upsert: true,
      contentType: mime,
    });
    if (uploadError) return res.status(500).json({ error: uploadError.message });

    await admin.from('expert_capture_media').upsert({
      id: mediaId,
      session_id: sessionId,
      answer_id: answerId,
      question_id: questionId,
      storage_path: storagePath,
      checksum_sha256: checksum,
      upload_status: 'uploaded',
      byte_size: bytes.byteLength,
      mime_type: mime,
      is_partial: body.isPartial === true,
      uploaded_at: new Date().toISOString(),
    });

    await writeExpertCaptureAudit(sessionId, 'answer.media_uploaded', { answerId, mediaId });
    return res.status(200).json({ ok: true, storagePath, checksumSha256: checksum, serverConfirmed: true });
  }

  return res.status(400).json({ error: 'Unknown action' });
}
