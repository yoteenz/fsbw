import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from '../_lib/supabase.js';
import {
  extractSessionRowFields,
  generateResumeToken,
  hashResumeToken,
  writeExpertCaptureAudit,
  EXPERT_CAPTURE_RESUME_TOKEN_TTL_MS,
  type ExpertCapturePersistedDocument,
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Expert-Capture-Resume-Token, X-Guest-Session-Id');
}

function readResumeToken(req: VercelRequest, body: Record<string, unknown>): string | null {
  const header = req.headers['x-expert-capture-resume-token'];
  if (typeof header === 'string' && header.trim()) return header.trim();
  if (typeof body.resumeToken === 'string' && body.resumeToken.trim()) return body.resumeToken.trim();
  return null;
}

function readGuestId(req: VercelRequest, body: Record<string, unknown>): string | null {
  const header = req.headers['x-guest-session-id'];
  if (typeof header === 'string' && header.trim()) return header.trim();
  if (typeof body.guestSessionId === 'string' && body.guestSessionId.trim()) return body.guestSessionId.trim();
  return null;
}

async function loadSessionRow(
  sessionId: string | null,
  resumeToken: string | null,
  guestSessionId: string | null
) {
  if (!hasSupabaseServiceRole()) return { row: null, error: 'Server persistence not configured' };
  const admin = getSupabaseAdminServiceRole();

  if (resumeToken) {
    const hash = hashResumeToken(resumeToken);
    const { data, error } = await admin
      .from('expert_capture_sessions')
      .select('*')
      .eq('resume_token_hash', hash)
      .neq('status', 'deleted')
      .maybeSingle();
    if (error) return { row: null, error: error.message };
    if (!data) return { row: null, error: 'Session not found' };
    if (data.resume_token_expires_at && new Date(data.resume_token_expires_at).getTime() < Date.now()) {
      return { row: null, error: 'Resume link expired' };
    }
    return { row: data, error: null };
  }

  if (sessionId) {
    const { data, error } = await admin
      .from('expert_capture_sessions')
      .select('*')
      .eq('id', sessionId)
      .neq('status', 'deleted')
      .maybeSingle();
    if (error) return { row: null, error: error.message };
    if (!data) return { row: null, error: 'Session not found' };
    if (guestSessionId && data.guest_session_id && data.guest_session_id !== guestSessionId) {
      return { row: null, error: 'Guest session mismatch' };
    }
    return { row: data, error: null };
  }

  return { row: null, error: 'Missing sessionId or resumeToken' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const body = parseBody(req);
  const authUser = await getAuthUser(req);
  const guestSessionId = readGuestId(req, body);
  const resumeToken = readResumeToken(req, body);

  if (req.method === 'GET') {
    const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : null;
    const listForGuest = req.query.list === '1' || req.query.list === 'true';
    if (!hasSupabaseServiceRole()) {
      return res.status(503).json({ error: 'Server persistence not configured', offline: true });
    }
    const admin = getSupabaseAdminServiceRole();

    if (listForGuest && guestSessionId) {
      const { data, error } = await admin
        .from('expert_capture_sessions')
        .select(
          'id, profile_id, company_id, expert_name, organization_label, status, recovery_status, progress_percent, current_section_id, session_document, last_saved_at, created_at'
        )
        .eq('guest_session_id', guestSessionId)
        .neq('status', 'deleted')
        .order('last_saved_at', { ascending: false })
        .limit(20);
      if (error) return res.status(500).json({ error: error.message });
      const items = (data ?? []).map((row) => summarizeListRow(row));
      return res.status(200).json({ items });
    }

    const { row, error } = await loadSessionRow(sessionId, resumeToken, guestSessionId);
    if (error || !row) return res.status(error === 'Session not found' ? 404 : 400).json({ error: error ?? 'Not found' });

    if (authUser && row.expert_user_id && row.expert_user_id !== authUser.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await admin
      .from('expert_capture_sessions')
      .update({ last_opened_at: new Date().toISOString() })
      .eq('id', row.id);
    await writeExpertCaptureAudit(row.id, 'session.resumed', { via: resumeToken ? 'token' : 'sessionId' });

    return res.status(200).json({
      document: row.session_document,
      sessionVersion: row.session_version,
      lastSavedAt: row.last_saved_at,
      activeDeviceId: row.active_device_id,
      serverConfirmed: true,
    });
  }

  if (req.method === 'POST') {
    const action = typeof body.action === 'string' ? body.action : 'sync';
    const document = body.document as ExpertCapturePersistedDocument | undefined;
    if (!document?.session) return res.status(400).json({ error: 'Missing document' });

    const fields = extractSessionRowFields(document);
    if (!fields.id) return res.status(400).json({ error: 'Missing session id' });

    if (!hasSupabaseServiceRole()) {
      return res.status(503).json({ error: 'Server persistence not configured', offline: true });
    }

    const admin = getSupabaseAdminServiceRole();
    const clientVersion = typeof body.expectedVersion === 'number' ? body.expectedVersion : document.sessionVersion ?? 1;
    const deviceId = typeof body.deviceId === 'string' ? body.deviceId : null;
    const claimDevice = action === 'claim_device' || body.claimDevice === true;

    const { data: existing } = await admin.from('expert_capture_sessions').select('*').eq('id', fields.id).maybeSingle();

    if (existing && existing.status === 'deleted') {
      return res.status(410).json({ error: 'Session deleted' });
    }

    if (existing && existing.session_version > clientVersion && action === 'sync') {
      return res.status(409).json({
        conflict: true,
        sessionVersion: existing.session_version,
        document: existing.session_document,
        lastSavedAt: existing.last_saved_at,
      });
    }

    if (
      existing?.active_device_id &&
      deviceId &&
      existing.active_device_id !== deviceId &&
      !claimDevice &&
      action === 'sync'
    ) {
      const staleMs = Date.now() - new Date(existing.active_device_updated_at ?? 0).getTime();
      if (staleMs < 5 * 60 * 1000) {
        return res.status(409).json({
          deviceConflict: true,
          activeDeviceId: existing.active_device_id,
          sessionVersion: existing.session_version,
          document: existing.session_document,
        });
      }
    }

    let tokenToReturn: string | undefined;
    let tokenHash = existing?.resume_token_hash ?? null;
    let tokenExpires = existing?.resume_token_expires_at ?? null;

    if (!tokenHash) {
      tokenToReturn = generateResumeToken();
      tokenHash = hashResumeToken(tokenToReturn);
      tokenExpires = new Date(Date.now() + EXPERT_CAPTURE_RESUME_TOKEN_TTL_MS).toISOString();
    }

    const now = new Date().toISOString();
    const nextVersion = (existing?.session_version ?? 0) + 1;
    const companyId = typeof body.companyId === 'string' ? body.companyId : existing?.company_id ?? 'studio-os';
    const profileId = typeof body.profileId === 'string' ? body.profileId : fields.profile_id;

    const row = {
      id: fields.id,
      session_version: nextVersion,
      profile_id: profileId,
      company_id: companyId,
      interview_template_version: typeof body.interviewTemplateVersion === 'string' ? body.interviewTemplateVersion : '1',
      expert_user_id: authUser?.id ?? existing?.expert_user_id ?? null,
      guest_session_id: guestSessionId ?? existing?.guest_session_id ?? null,
      resume_token_hash: tokenHash,
      resume_token_expires_at: tokenExpires,
      expert_name: fields.expert_name,
      expert_role: fields.expert_role,
      organization_label: fields.organization_label,
      status: fields.status,
      recovery_status: fields.recovery_status,
      consent_status: fields.consent_status,
      retention_status: existing?.retention_status ?? 'active',
      export_status: fields.export_status,
      session_summary_status: fields.session_summary_status,
      progress_percent: fields.progress_percent,
      current_section_id: fields.current_section_id,
      current_question_id: fields.current_question_id,
      current_question_index: fields.current_question_index,
      current_workflow_stage: fields.current_workflow_stage,
      last_mutation_id: typeof document.lastMutationId === 'string' ? document.lastMutationId : null,
      active_device_id: claimDevice ? deviceId : deviceId ?? existing?.active_device_id ?? null,
      active_device_updated_at: deviceId ? now : existing?.active_device_updated_at ?? null,
      session_document: { ...document, sessionVersion: nextVersion },
      device_metadata: body.deviceMetadata ?? existing?.device_metadata ?? {},
      updated_at: now,
      last_saved_at: now,
      last_opened_at: existing?.last_opened_at ?? now,
      created_at: existing?.created_at ?? now,
    };

    const { error: upsertError } = await admin.from('expert_capture_sessions').upsert(row, { onConflict: 'id' });
    if (upsertError) return res.status(500).json({ error: upsertError.message });

    const auditType =
      action === 'claim_device'
        ? 'device.claimed'
        : existing
          ? 'session.saved'
          : 'session.created';
    await writeExpertCaptureAudit(fields.id, auditType, { deviceId, version: nextVersion });

    if (action === 'archive_and_restart') {
      await admin.from('expert_capture_session_archives').insert({
        id: `archive-${fields.id}-${Date.now()}`,
        original_session_id: fields.id,
        profile_id: profileId,
        company_id: companyId,
        archived_document: existing?.session_document ?? document,
      });
      await writeExpertCaptureAudit(fields.id, 'session.archived', {});
    }

    return res.status(200).json({
      ok: true,
      sessionVersion: nextVersion,
      lastSavedAt: now,
      resumeToken: tokenToReturn,
      serverConfirmed: true,
    });
  }

  if (req.method === 'DELETE') {
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : typeof req.query.sessionId === 'string' ? req.query.sessionId : null;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });
    if (!hasSupabaseServiceRole()) return res.status(503).json({ error: 'Server persistence not configured' });

    const { row } = await loadSessionRow(sessionId, resumeToken, guestSessionId);
    if (!row) return res.status(404).json({ error: 'Session not found' });

    const admin = getSupabaseAdminServiceRole();
    await admin
      .from('expert_capture_sessions')
      .update({
        status: 'deleted',
        recovery_status: 'deleted',
        resume_token_hash: null,
        resume_token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    const { data: mediaRows } = await admin.from('expert_capture_media').select('storage_path').eq('session_id', sessionId);
    if (mediaRows?.length) {
      await admin.storage.from('expert-capture-media').remove(mediaRows.map((m) => m.storage_path));
      await admin.from('expert_capture_media').delete().eq('session_id', sessionId);
    }

    await writeExpertCaptureAudit(sessionId, 'session.deleted', {});
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST, DELETE, OPTIONS');
  return res.status(405).json({ error: 'Method not allowed' });
}

function summarizeListRow(row: Record<string, unknown>) {
  const doc = row.session_document as ExpertCapturePersistedDocument | undefined;
  const session = doc?.session as {
    questions?: Array<{ text: string }>;
    answers?: Array<{ status?: string; skipped?: boolean }>;
  } | undefined;
  const answers = session?.answers ?? [];
  return {
    sessionId: row.id,
    profileId: row.profile_id,
    companyId: row.company_id,
    expertName: row.expert_name,
    organizationLabel: row.organization_label,
    status: row.status,
    recoveryStatus: row.recovery_status,
    progressPercent: row.progress_percent,
    currentSectionId: row.current_section_id,
    currentQuestionText: session?.questions?.[0]?.text ?? null,
    lastSavedAt: row.last_saved_at,
    createdAt: row.created_at,
    approvedCount: answers.filter((a) => a.status === 'approved').length,
    pendingReviewCount: answers.filter((a) => a.status !== 'approved' && !a.skipped).length,
    skippedCount: answers.filter((a) => a.skipped).length,
  };
}
