export const config = { maxDuration: 60 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';
import { writeAuditLog } from '../_lib/auditLog';

function parseBody(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') {
    try {
      const p = JSON.parse(b) as unknown;
      return p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (b && typeof b === 'object' && !Array.isArray(b)) return b as Record<string, unknown>;
  return {};
}

/**
 * POST /api/admin/meeting-client-alert
 * Body: { userId?, clientEmail?, meetingId, reason, message, action: 'reschedule' | 'cancel' }
 * Appends a client notifications row so they can respond (alerts UI).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = parseBody(req);
  const meetingId = String(body.meetingId || body.meeting_id || '').trim();
  const reason = String(body.reason || '').trim().toUpperCase() || 'OTHER';
  const message = String(body.message || body.adminMessage || '').trim();
  const actionRaw = String(body.action || body.flow || 'reschedule').toLowerCase();
  const action = actionRaw === 'cancel' ? 'cancel' : 'reschedule';

  let userId = typeof body.userId === 'string' ? body.userId.trim() : '';
  const clientEmail = String(body.clientEmail || body.client_email || '')
    .trim()
    .toLowerCase();

  if (!meetingId) return res.status(400).json({ error: 'meetingId required' });

  const supabase = getSupabaseAdmin();

  try {
    if (!userId && clientEmail) {
      const { data: prof, error: pErr } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', clientEmail)
        .maybeSingle();
      if (pErr) return res.status(500).json({ error: pErr.message });
      userId = (prof as { id?: string } | null)?.id || '';
    }

    if (!userId) {
      return res.status(400).json({
        error: 'Client user id or email required to send alert',
      });
    }

    const header =
      action === 'cancel'
        ? '[APPOINTMENT · CANCEL REQUEST]'
        : '[APPOINTMENT · RESCHEDULE REQUEST]';
    const bodyLine = message ? message.toUpperCase() : 'PLEASE REVIEW YOUR ALERTS.';
    const notifText = `${header} REASON: ${reason}. NOTE: ${bodyLine} YOU CAN ACCEPT, PROPOSE A NEW TIME, OR CANCEL FROM YOUR ACCOUNT.`;

    const newItem = {
      id: crypto.randomUUID(),
      text: notifText,
      read: false,
      createdAt: new Date().toISOString(),
      actionText: 'REVIEW APPOINTMENT',
      actionRoute: '/account/notifications',
      meetingAlert: {
        meetingId,
        reason,
        adminMessage: message,
        action,
      },
    };

    const { data: existing, error: fetchErr } = await supabase
      .from('notifications')
      .select('items')
      .eq('user_id', userId)
      .maybeSingle();
    if (fetchErr) return res.status(500).json({ error: fetchErr.message });

    const items = Array.isArray((existing as { items?: unknown[] } | null)?.items)
      ? (existing as { items: unknown[] }).items
      : [];
    const next = [...items, newItem];

    if (existing) {
      const { error: updErr } = await supabase
        .from('notifications')
        .update({ items: next, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (updErr) return res.status(500).json({ error: updErr.message });
    } else {
      const { error: insErr } = await supabase.from('notifications').insert({ user_id: userId, items: next });
      if (insErr) return res.status(500).json({ error: insErr.message });
    }

    await writeAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'meeting.client_alert',
      resourceType: 'meetings',
      resourceId: meetingId,
      details: { userId, action, reason },
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
