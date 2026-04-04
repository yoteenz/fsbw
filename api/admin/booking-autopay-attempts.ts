import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function toAttemptRow(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    userId: row.user_id,
    attemptNumber: row.attempt_number,
    status: row.status,
    amountUsd: row.amount_usd,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    stripeCustomerId: row.stripe_customer_id,
    stripePaymentMethodId: row.stripe_payment_method_id,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    nextRetryAt: row.next_retry_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** GET /api/admin/booking-autopay-attempts?meeting_id=&user_id=&status=&limit= */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const admin = await requireAdmin(req);
  if (!admin) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    let q = supabase.from('booking_autopay_attempts').select('*');
    const meetingId = typeof req.query.meeting_id === 'string' ? req.query.meeting_id.trim() : '';
    const userId = typeof req.query.user_id === 'string' ? req.query.user_id.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : '';
    const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : 100;
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(200, Math.round(limitRaw))) : 100;
    if (meetingId) q = q.eq('meeting_id', meetingId);
    if (userId) q = q.eq('user_id', userId);
    if (status && ['succeeded', 'failed', 'cancelled', 'skipped'].includes(status)) q = q.eq('status', status);
    const { data, error } = await q.order('created_at', { ascending: false }).limit(limit);
    if (error) {
      sendJson(res, 500, { error: error.message });
      return;
    }
    const attempts = (Array.isArray(data) ? data : []).map((r) => toAttemptRow(r as Record<string, unknown>));
    sendJson(res, 200, { attempts });
  } catch (e) {
    sendJson(res, 500, { error: e instanceof Error ? e.message : 'Internal error' });
  }
}
