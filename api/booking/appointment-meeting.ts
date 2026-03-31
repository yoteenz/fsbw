import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth';
import { getSupabaseAdmin } from '../_lib/supabase';

type Body = {
  meetingDate?: string;
  meetingTime?: string;
  type?: string;
  durationMinutes?: number;
  notes?: string;
  orderNumber?: string;
  idempotencyKey?: string;
};

function sanitizeType(raw: unknown): string {
  const t = String(raw || '').trim().toUpperCase();
  return t || 'APPOINTMENT';
}

function sanitizeDate(raw: unknown): string {
  const d = String(raw || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '';
}

function sanitizeTime(raw: unknown): string {
  const t = String(raw || '').trim().toUpperCase();
  return t;
}

function sanitizeIdempotencyKey(raw: unknown): string {
  const key = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9._:@-]/g, '-')
    .slice(0, 140);
  return key;
}

/** POST /api/booking/appointment-meeting — create pending meeting row from customer checkout. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Body;
  const meetingDate = sanitizeDate(body.meetingDate);
  const meetingTime = sanitizeTime(body.meetingTime);
  if (!meetingDate || !meetingTime) {
    return res.status(400).json({ error: 'meetingDate and meetingTime are required' });
  }

  const type = sanitizeType(body.type);
  const durationMinutes = Math.max(15, Math.min(480, Number(body.durationMinutes) || 120));
  const orderNumber = String(body.orderNumber || '').trim().toUpperCase();
  const idempotencyKey = sanitizeIdempotencyKey(body.idempotencyKey);
  const rawNotes = String(body.notes || '').trim();
  const notes = [
    idempotencyKey ? `IDEMPOTENCY:${idempotencyKey}` : '',
    orderNumber ? `ORDER ${orderNumber}` : '',
    rawNotes
  ]
    .filter(Boolean)
    .join(' · ')
    .slice(0, 800);

  try {
    const supabase = getSupabaseAdmin();
    if (idempotencyKey) {
      const { data: existing, error: existingError } = await supabase
        .from('meetings')
        .select('id, meeting_date, meeting_time, type, status, notes')
        .eq('user_id', user.id)
        .eq('meeting_date', meetingDate)
        .eq('meeting_time', meetingTime)
        .eq('type', type)
        .ilike('notes', `%IDEMPOTENCY:${idempotencyKey}%`)
        .limit(1);
      if (existingError) return res.status(500).json({ error: existingError.message });
      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(200).json({ meeting: existing[0], idempotent: true });
      }
    }

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        client_email: user.email || null,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        type,
        duration_minutes: durationMinutes,
        status: 'pending',
        notes: notes || null
      })
      .select('id, meeting_date, meeting_time, type, status')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ meeting: data });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}

