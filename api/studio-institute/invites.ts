import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { isAdminEmail } from '../_lib/adminAuth.js';
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

const TOKEN_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Studio-Institute-Owner-Key');
}

function generateToken(): string {
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += TOKEN_CHARSET[Math.floor(Math.random() * TOKEN_CHARSET.length)];
  }
  return out;
}

function rowToInvite(row: InviteRow) {
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
  };
}

async function isOwner(req: VercelRequest): Promise<boolean> {
  const key = req.headers['x-studio-institute-owner-key'];
  const envKey = process.env.STUDIO_INSTITUTE_OWNER_KEY;
  if (envKey && typeof key === 'string' && key === envKey) return true;
  const user = await getAuthUser(req);
  if (user?.email && isAdminEmail(user.email)) return true;
  return false;
}

function isExpired(row: InviteRow): boolean {
  if (!row.expires_at) return false;
  return new Date(row.expires_at).getTime() < Date.now();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!hasSupabaseServiceRole()) {
    return res.status(503).json({ error: 'Invite storage not configured', offline: true });
  }

  const admin = getSupabaseAdminServiceRole();

  if (req.method === 'GET') {
    const token = typeof req.query.token === 'string' ? req.query.token : null;
    if (token) {
      const { data, error } = await admin.from('studio_institute_invites').select('*').eq('token', token).maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      if (!data) return res.status(404).json({ error: 'Invite not found' });
      if (isExpired(data as InviteRow)) return res.status(410).json({ error: 'Invite expired' });
      if (data.status === 'archived') return res.status(410).json({ error: 'Invite archived' });
      return res.status(200).json({ invite: rowToInvite(data as InviteRow) });
    }

    if (!(await isOwner(req))) return res.status(401).json({ error: 'Owner access required' });
    const { data, error } = await admin
      .from('studio_institute_invites')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ invites: (data ?? []).map((r) => rowToInvite(r as InviteRow)) });
  }

  if (req.method === 'POST') {
    if (!(await isOwner(req))) return res.status(401).json({ error: 'Owner access required' });
    const body = parseBody(req);
    const now = new Date().toISOString();
    const id = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let token = generateToken();
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: existing } = await admin.from('studio_institute_invites').select('id').eq('token', token).maybeSingle();
      if (!existing) break;
      token = generateToken();
    }
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
      expires_at: typeof body.expiresAt === 'string' ? body.expiresAt : null,
      created_at: now,
      updated_at: now,
    };
    if (!row.invitee_name || !row.business_name) {
      return res.status(400).json({ error: 'Missing invitee or business name' });
    }
    const { data, error } = await admin.from('studio_institute_invites').insert(row).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ invite: rowToInvite(data as InviteRow) });
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    const id = typeof body.id === 'string' ? body.id : null;
    const token = typeof body.token === 'string' ? body.token : null;
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

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
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
      archivedAt: 'archived_at',
    };

    for (const [key, col] of Object.entries(map)) {
      if (patch[key] === undefined) continue;
      if (!owner && !allowedForInvitee.includes(key)) continue;
      update[col] = patch[key];
    }

    if (owner && patch.status === 'archived') {
      update.archived_at = new Date().toISOString();
    }

    const { data, error } = await admin
      .from('studio_institute_invites')
      .update(update)
      .eq('id', (existing as InviteRow).id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ invite: rowToInvite(data as InviteRow) });
  }

  if (req.method === 'DELETE') {
    if (!(await isOwner(req))) return res.status(401).json({ error: 'Owner access required' });
    const id = typeof req.query.id === 'string' ? req.query.id : null;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { error } = await admin.from('studio_institute_invites').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE, OPTIONS');
  return res.status(405).json({ error: 'Method not allowed' });
}
