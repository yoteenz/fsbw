import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { writeAuditLog } from '../_lib/auditLog.js';

function toMeetingItem(r: Record<string, unknown>) {
  return {
    id: r.id,
    userId: r.user_id,
    clientEmail: r.client_email,
    clientName: r.client_name,
    meetingDate: r.meeting_date,
    meetingTime: r.meeting_time,
    type: r.type,
    durationMinutes: r.duration_minutes,
    status: r.status,
    notes: r.notes,
    category: r.category ?? 'appointment',
    metadata: r.metadata ?? {},
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** GET /api/admin/meetings – list (optional ?user_id=, ?date=). POST – create. PATCH – update. DELETE – delete. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const supabase = getSupabaseAdmin();

  if (req.method === 'GET') {
    try {
      let q = supabase.from('meetings').select('*');
      const userId = typeof req.query.user_id === 'string' ? req.query.user_id.trim() : '';
      const date = typeof req.query.date === 'string' ? req.query.date.trim() : '';
      if (userId) q = q.eq('user_id', userId);
      if (date) q = q.eq('meeting_date', date);
      const { data, error } = await q.order('meeting_date', { ascending: true }).order('meeting_time', { ascending: true }).limit(200);
      if (error) return res.status(500).json({ error: error.message });
      const rows = Array.isArray(data) ? data : [];
      return res.status(200).json({ meetings: rows.map((r) => toMeetingItem(r as Record<string, unknown>)) });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const userId = body.userId as string || body.user_id as string || null;
    const clientEmail = (body.clientEmail || body.client_email) as string || '';
    const clientName = (body.clientName || body.client_name) as string || '';
    const meetingDate = (body.meetingDate || body.meeting_date) as string;
    const meetingTime = (body.meetingTime || body.meeting_time) as string || null;
    const type = (body.type as string) || 'Consultation';
    const durationMinutes = Math.max(15, Math.min(480, Number(body.durationMinutes || body.duration_minutes) || 60));
    const status = (body.status as string) || 'scheduled';
    const notes = (body.notes as string) || '';
    const categoryRaw = String(body.category || body.meetingCategory || 'appointment').toLowerCase();
    const category =
      categoryRaw === 'consultation' || categoryRaw === 'consult' ? 'consultation' : 'appointment';
    const metadata =
      body.metadata && typeof body.metadata === 'object' ? body.metadata : undefined;
    if (!meetingDate) return res.status(400).json({ error: 'meetingDate required' });
    try {
      const insertRow: Record<string, unknown> = {
        user_id: userId || null,
        client_email: clientEmail || null,
        client_name: clientName || null,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        type,
        duration_minutes: durationMinutes,
        status: ['scheduled', 'confirmed', 'completed', 'cancelled', 'pending'].includes(status)
          ? status
          : 'scheduled',
        notes: notes || null,
        category,
      };
      if (metadata !== undefined) insertRow.metadata = metadata;
      const { data, error } = await supabase
        .from('meetings')
        .insert(insertRow)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      await writeAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'meeting.create',
        resourceType: 'meetings',
        resourceId: (data as Record<string, unknown>)?.id as string,
        details: { meetingDate, type },
      });
      return res.status(201).json(toMeetingItem((data ?? {}) as Record<string, unknown>));
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  if (req.method === 'PATCH') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const id = body.id as string;
    if (!id) return res.status(400).json({ error: 'id required' });
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.meetingDate !== undefined) updates.meeting_date = body.meetingDate;
    if (body.meetingTime !== undefined) updates.meeting_time = body.meetingTime;
    if (body.type !== undefined) updates.type = body.type;
    if (body.durationMinutes !== undefined) updates.duration_minutes = body.durationMinutes;
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.clientName !== undefined) updates.client_name = body.clientName;
    if (body.clientEmail !== undefined) updates.client_email = body.clientEmail;
    if (body.category !== undefined) updates.category = body.category;
    if (body.metadata !== undefined) updates.metadata = body.metadata;
    try {
      const { data, error } = await supabase.from('meetings').update(updates).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      await writeAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'meeting.update',
        resourceType: 'meetings',
        resourceId: id,
        details: updates,
      });
      return res.status(200).json(toMeetingItem((data ?? {}) as Record<string, unknown>));
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  if (req.method === 'DELETE') {
    const id = typeof req.query.id === 'string' ? req.query.id.trim() : (req.body as { id?: string })?.id;
    if (!id) return res.status(400).json({ error: 'id required' });
    try {
      await supabase.from('meetings').delete().eq('id', id);
      await writeAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'meeting.delete',
        resourceType: 'meetings',
        resourceId: id,
        details: {},
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
