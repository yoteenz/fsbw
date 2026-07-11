import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'crypto';
import { getAuthUser } from '../_lib/auth.js';
import { isAdminEmail, resolveAdminAuth } from '../_lib/adminAuth.js';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from '../_lib/supabase.js';

type InviteRow = {
  id: string;
  token: string;
  invitee_name: string;
  business_name: string;
  role: string;
  worker_being_created: string;
  profile_id: string;
  company_id: string;
  status: string;
  access_status: string;
  welcome_note: string | null;
  pin_hash: string | null;
  revoked_tokens: string[] | null;
  audit_log: AuditRow[] | null;
  session_id: string | null;
  progress_percent: number;
  current_question_label: string | null;
  current_question_index: number | null;
  time_spent_minutes: number;
  last_active_at: string | null;
  latest_lesson: string | null;
  knowledge_extracted_count: number;
  expires_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type AuditRow = { event: string; at: string };

const TOKEN_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const OWNER_PASSWORD_CONFIG_KEY = 'studio_institute_owner_password_hash';
const PASSWORD_HASH_RE = /^[a-f0-9]{64}$/i;
const AUDIT_EVENTS = new Set([
  'invite_created',
  'link_copied',
  'message_copied',
  'share_initiated',
  'invite_previewed',
  'link_regenerated',
  'access_paused',
  'access_resumed',
  'invite_revoked',
  'invite_archived',
  'invite_deleted',
]);

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Studio-Institute-Owner-Key, X-Studio-Institute-Recovery-Secret');
}

function generateToken(): string {
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += TOKEN_CHARSET[Math.floor(Math.random() * TOKEN_CHARSET.length)];
  }
  return out;
}

function hashPin(pin: string): string {
  return createHash('sha256').update(pin.trim()).digest('hex');
}

function rowToInvite(row: InviteRow, opts: { includePinHash?: boolean } = {}) {
  return {
    id: row.id,
    token: row.token,
    inviteeName: row.invitee_name,
    businessName: row.business_name,
    role: row.role,
    workerBeingCreated: row.worker_being_created,
    profileId: row.profile_id,
    companyId: row.company_id,
    status: row.status,
    accessStatus: row.access_status ?? 'active',
    welcomeNote: row.welcome_note,
    pinHash: opts.includePinHash ? row.pin_hash : null,
    hasPin: Boolean(row.pin_hash),
    sessionId: row.session_id,
    progressPercent: Number(row.progress_percent ?? 0),
    currentQuestionLabel: row.current_question_label,
    currentQuestionIndex: row.current_question_index,
    timeSpentMinutes: Number(row.time_spent_minutes ?? 0),
    lastActiveAt: row.last_active_at,
    latestLesson: row.latest_lesson,
    knowledgeExtractedCount: row.knowledge_extracted_count ?? 0,
    expiresAt: row.expires_at,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    revokedTokens: Array.isArray(row.revoked_tokens) ? row.revoked_tokens : [],
  };
}

function appendAudit(row: InviteRow, event: string): AuditRow[] {
  if (!AUDIT_EVENTS.has(event)) return row.audit_log ?? [];
  const next = [...(row.audit_log ?? []), { event, at: new Date().toISOString() }];
  return next.slice(-100);
}

async function getStoredOwnerPasswordHash(admin: ReturnType<typeof getSupabaseAdminServiceRole>): Promise<string | null> {
  const { data, error } = await admin.from('app_config').select('value').eq('key', OWNER_PASSWORD_CONFIG_KEY).maybeSingle();
  if (error || !data?.value) return null;
  const value = data.value;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'hash' in value) {
    const hash = (value as { hash?: unknown }).hash;
    return typeof hash === 'string' ? hash : null;
  }
  return null;
}

async function isOwner(req: VercelRequest): Promise<boolean> {
  const key = req.headers['x-studio-institute-owner-key'];
  if (typeof key === 'string' && key.length > 0) {
    const envKey = process.env.STUDIO_INSTITUTE_OWNER_KEY;
    if (envKey && key === envKey) return true;
    const admin = getSupabaseAdminServiceRole();
    const storedHash = await getStoredOwnerPasswordHash(admin);
    if (storedHash && key === storedHash) return true;
  }
  const user = await getAuthUser(req);
  if (user?.email && isAdminEmail(user.email)) return true;
  return false;
}

async function setupOwnerPassword(
  admin: ReturnType<typeof getSupabaseAdminServiceRole>,
  passwordHash: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!PASSWORD_HASH_RE.test(passwordHash)) {
    return { ok: false, status: 400, error: 'Invalid password hash' };
  }
  const existing = await getStoredOwnerPasswordHash(admin);
  if (existing) {
    return { ok: false, status: 409, error: 'Owner password already configured' };
  }
  const now = new Date().toISOString();
  const { error } = await admin.from('app_config').upsert(
    { key: OWNER_PASSWORD_CONFIG_KEY, value: passwordHash, updated_at: now },
    { onConflict: 'key' }
  );
  if (error) return { ok: false, status: 500, error: error.message };
  return { ok: true };
}

async function resetOwnerPassword(
  admin: ReturnType<typeof getSupabaseAdminServiceRole>,
  passwordHash: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!PASSWORD_HASH_RE.test(passwordHash)) {
    return { ok: false, status: 400, error: 'Invalid password hash' };
  }
  const now = new Date().toISOString();
  const { error } = await admin.from('app_config').upsert(
    { key: OWNER_PASSWORD_CONFIG_KEY, value: passwordHash, updated_at: now },
    { onConflict: 'key' }
  );
  if (error) return { ok: false, status: 500, error: error.message };
  return { ok: true };
}

async function canResetOwnerPassword(req: VercelRequest): Promise<boolean> {
  if (await isOwner(req)) return true;
  const recoverySecret = process.env.STUDIO_INSTITUTE_OWNER_RECOVERY_SECRET?.trim();
  const body = parseBody(req);
  const provided =
    typeof body.recoverySecret === 'string'
      ? body.recoverySecret.trim()
      : typeof req.headers['x-studio-institute-recovery-secret'] === 'string'
        ? req.headers['x-studio-institute-recovery-secret'].trim()
        : '';
  if (recoverySecret && provided && provided === recoverySecret) return true;
  const envKey = process.env.STUDIO_INSTITUTE_OWNER_KEY;
  const header = req.headers['x-studio-institute-owner-key'];
  if (envKey && typeof header === 'string' && header === envKey) return true;
  const adminAuth = await resolveAdminAuth(req);
  return adminAuth.ok;
}

async function verifyOwnerPasswordHash(
  admin: ReturnType<typeof getSupabaseAdminServiceRole>,
  passwordHash: string
): Promise<boolean> {
  if (!PASSWORD_HASH_RE.test(passwordHash)) return false;
  const storedHash = await getStoredOwnerPasswordHash(admin);
  return Boolean(storedHash && passwordHash === storedHash);
}

function isExpired(row: InviteRow): boolean {
  if (!row.expires_at) return false;
  return new Date(row.expires_at).getTime() < Date.now();
}

function accessBlocked(row: InviteRow): string | null {
  if (row.access_status === 'deleted') return 'unavailable';
  if (row.access_status === 'revoked') return 'unavailable';
  if (row.access_status === 'paused') return 'unavailable';
  if (row.access_status === 'archived' || row.status === 'archived') return 'unavailable';
  if (isExpired(row) || row.access_status === 'expired') return 'unavailable';
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!hasSupabaseServiceRole()) {
    return res.status(503).json({ error: 'Invite storage not configured', offline: true });
  }

  const admin = getSupabaseAdminServiceRole();

  if (req.method === 'GET') {
    if (req.query.owner_auth_status === '1') {
      const storedHash = await getStoredOwnerPasswordHash(admin);
      const envConfigured = Boolean(process.env.STUDIO_INSTITUTE_OWNER_KEY);
      return res.status(200).json({ configured: Boolean(storedHash) || envConfigured });
    }

    const token = typeof req.query.token === 'string' ? req.query.token : null;
    if (token) {
      const { data, error } = await admin.from('studio_institute_invites').select('*').eq('token', token).maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      if (!data) {
        const { data: revokedHit } = await admin
          .from('studio_institute_invites')
          .select('*')
          .contains('revoked_tokens', [token])
          .maybeSingle();
        if (revokedHit) return res.status(410).json({ error: 'Invite link revoked', unavailable: true });
        return res.status(404).json({ error: 'Invite not found' });
      }
      const row = data as InviteRow;
      if (accessBlocked(row)) return res.status(410).json({ error: 'Invite unavailable', unavailable: true });
      return res.status(200).json({ invite: rowToInvite(row) });
    }

    if (!(await isOwner(req))) return res.status(401).json({ error: 'Owner access required' });
    const { data, error } = await admin
      .from('studio_institute_invites')
      .select('*')
      .neq('access_status', 'deleted')
      .order('updated_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ invites: (data ?? []).map((r) => rowToInvite(r as InviteRow, { includePinHash: true })) });
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    if (body.action === 'setup_owner_password') {
      const passwordHash = typeof body.passwordHash === 'string' ? body.passwordHash.trim() : '';
      const result = await setupOwnerPassword(admin, passwordHash);
      if (!result.ok) return res.status(result.status).json({ error: result.error });
      return res.status(201).json({ ok: true });
    }

    if (body.action === 'verify_owner_password') {
      const passwordHash = typeof body.passwordHash === 'string' ? body.passwordHash.trim() : '';
      const valid = await verifyOwnerPasswordHash(admin, passwordHash);
      return res.status(200).json({ valid });
    }

    if (body.action === 'reset_owner_password') {
      if (!(await canResetOwnerPassword(req))) {
        return res.status(403).json({ error: 'Owner password reset not authorized' });
      }
      const passwordHash = typeof body.passwordHash === 'string' ? body.passwordHash.trim() : '';
      const result = await resetOwnerPassword(admin, passwordHash);
      if (!result.ok) return res.status(result.status).json({ error: result.error });
      return res.status(200).json({ ok: true, reset: true });
    }

    if (!(await isOwner(req))) return res.status(401).json({ error: 'Owner access required' });
    const now = new Date().toISOString();
    const id = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let token = generateToken();
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: existing } = await admin.from('studio_institute_invites').select('id').eq('token', token).maybeSingle();
      if (!existing) break;
      token = generateToken();
    }
    const pinFromBody = typeof body.pinHash === 'string' ? body.pinHash : null;
    const accessPin = typeof body.accessPin === 'string' ? body.accessPin.trim() : '';
    const pin_hash = pinFromBody || (accessPin ? hashPin(accessPin) : null);
    const row = {
      id,
      token,
      invitee_name: String(body.inviteeName ?? '').trim(),
      business_name: String(body.businessName ?? '').trim(),
      role: String(body.role ?? '').trim(),
      worker_being_created: String(body.workerBeingCreated ?? '').trim(),
      profile_id: String(body.profileId ?? 'generic-v1'),
      company_id: String(body.companyId ?? 'studio-os'),
      status: 'not_started',
      access_status: String(body.accessStatus ?? 'active'),
      welcome_note: typeof body.welcomeNote === 'string' ? body.welcomeNote.trim() || null : null,
      pin_hash,
      revoked_tokens: [],
      audit_log: [{ event: 'invite_created', at: now }],
      expires_at: typeof body.expiresAt === 'string' ? body.expiresAt : null,
      created_at: now,
      updated_at: now,
    };
    if (!row.invitee_name || !row.business_name) {
      return res.status(400).json({ error: 'Missing invitee or business name' });
    }
    const { data, error } = await admin.from('studio_institute_invites').insert(row).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ invite: rowToInvite(data as InviteRow, { includePinHash: true }) });
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    const id = typeof body.id === 'string' ? body.id : null;
    const token = typeof body.token === 'string' ? body.token : null;
    const action = typeof body.action === 'string' ? body.action : null;
    const auditEvent = typeof body.auditEvent === 'string' ? body.auditEvent : null;
    const patch = (body.patch ?? {}) as Record<string, unknown>;
    const owner = await isOwner(req);

    if (!id && !token) return res.status(400).json({ error: 'Missing id or token' });
    if (!owner && !token) return res.status(401).json({ error: 'Unauthorized' });

    let query = admin.from('studio_institute_invites').select('*');
    if (id) query = query.eq('id', id);
    else if (token) query = query.eq('token', token);

    const { data: existing, error: loadErr } = await query.maybeSingle();
    if (loadErr) return res.status(500).json({ error: loadErr.message });
    if (!existing) return res.status(404).json({ error: 'Invite not found' });

    const row = existing as InviteRow;
    const now = new Date().toISOString();
    let audit_log = row.audit_log ?? [];

    if (owner && action === 'regenerate_token') {
      const oldToken = row.token;
      let newToken = generateToken();
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: clash } = await admin.from('studio_institute_invites').select('id').eq('token', newToken).maybeSingle();
        if (!clash) break;
        newToken = generateToken();
      }
      const revoked_tokens = [...(Array.isArray(row.revoked_tokens) ? row.revoked_tokens : []), oldToken];
      audit_log = appendAudit({ ...row, audit_log }, 'link_regenerated');
      const { data, error } = await admin
        .from('studio_institute_invites')
        .update({ token: newToken, revoked_tokens, audit_log, updated_at: now })
        .eq('id', row.id)
        .select('*')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ invite: rowToInvite(data as InviteRow, { includePinHash: true }) });
    }

    if (owner && action === 'audit' && auditEvent && AUDIT_EVENTS.has(auditEvent)) {
      audit_log = appendAudit({ ...row, audit_log }, auditEvent);
      const { data, error } = await admin
        .from('studio_institute_invites')
        .update({ audit_log, updated_at: now })
        .eq('id', row.id)
        .select('*')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ invite: rowToInvite(data as InviteRow, { includePinHash: true }) });
    }

    const allowedForInvitee = [
      'sessionId',
      'progressPercent',
      'currentQuestionLabel',
      'currentQuestionIndex',
      'timeSpentMinutes',
      'lastActiveAt',
      'latestLesson',
      'knowledgeExtractedCount',
      'status',
    ];

    const update: Record<string, unknown> = { updated_at: now };
    const map: Record<string, string> = {
      sessionId: 'session_id',
      progressPercent: 'progress_percent',
      currentQuestionLabel: 'current_question_label',
      currentQuestionIndex: 'current_question_index',
      timeSpentMinutes: 'time_spent_minutes',
      lastActiveAt: 'last_active_at',
      latestLesson: 'latest_lesson',
      knowledgeExtractedCount: 'knowledge_extracted_count',
      status: 'status',
      accessStatus: 'access_status',
      archivedAt: 'archived_at',
      welcomeNote: 'welcome_note',
    };

    for (const [key, col] of Object.entries(map)) {
      if (patch[key] === undefined) continue;
      if (!owner && !allowedForInvitee.includes(key)) continue;
      update[col] = patch[key];
    }

    if (owner && patch.status === 'archived') {
      update.archived_at = now;
      update.access_status = 'archived';
      audit_log = appendAudit({ ...row, audit_log }, 'invite_archived');
      update.audit_log = audit_log;
    }
    if (owner && patch.accessStatus === 'paused') {
      audit_log = appendAudit({ ...row, audit_log }, 'access_paused');
      update.audit_log = audit_log;
    }
    if (owner && patch.accessStatus === 'active' && row.access_status === 'paused') {
      audit_log = appendAudit({ ...row, audit_log }, 'access_resumed');
      update.audit_log = audit_log;
    }
    if (owner && patch.accessStatus === 'revoked') {
      audit_log = appendAudit({ ...row, audit_log }, 'invite_revoked');
      update.audit_log = audit_log;
    }

    const { data, error } = await admin
      .from('studio_institute_invites')
      .update(update)
      .eq('id', row.id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ invite: rowToInvite(data as InviteRow, { includePinHash: owner }) });
  }

  if (req.method === 'DELETE') {
    if (!(await isOwner(req))) return res.status(401).json({ error: 'Owner access required' });
    const id = typeof req.query.id === 'string' ? req.query.id : null;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { data: existing } = await admin.from('studio_institute_invites').select('*').eq('id', id).maybeSingle();
    if (existing) {
      const audit_log = appendAudit(existing as InviteRow, 'invite_deleted');
      await admin
        .from('studio_institute_invites')
        .update({ access_status: 'deleted', audit_log, updated_at: new Date().toISOString() })
        .eq('id', id);
    }
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE, OPTIONS');
  return res.status(405).json({ error: 'Method not allowed' });
}
