import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getSupabaseUser } from '../_lib/supabase.js';

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

/** POST /api/client/priority-messages — member priority message (Concierge UI). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = parseBody(req);
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > 8000) {
    return res.status(400).json({ error: 'message required (max 8000 chars)' });
  }

  const isOrderRelated = body.isOrderRelated === true || body.is_order_related === true;
  const isUrgent = body.isUrgent === true || body.is_urgent === true;
  const relatedOrderId =
    typeof body.relatedOrderId === 'string'
      ? body.relatedOrderId.trim().slice(0, 80)
      : typeof body.related_order_id === 'string'
        ? body.related_order_id.trim().slice(0, 80)
        : null;

  let clientName: string | null = null;
  if (typeof body.clientName === 'string' && body.clientName.trim()) {
    clientName = body.clientName.trim().slice(0, 200);
  }

  const supabase = getSupabaseUser(user.accessToken);
  const { data, error } = await supabase
    .from('priority_messages')
    .insert({
      user_id: user.id,
      client_email: user.email,
      client_name: clientName,
      message,
      is_order_related: isOrderRelated,
      is_urgent: isUrgent,
      related_order_id: relatedOrderId,
      source: 'concierge',
      status: 'new',
    })
    .select('id, created_at, status')
    .single();

  if (error) {
    const hint =
      error.message.includes('priority_messages') || error.code === '42P01'
        ? 'Run supabase/migrations/20260603180000_priority_messages.sql in Supabase SQL Editor.'
        : undefined;
    return res.status(error.code === '42501' ? 403 : 500).json({ error: error.message, hint });
  }

  return res.status(200).json({ ok: true, message: data });
}
