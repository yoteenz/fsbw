import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '../_lib/auth.js';
import { creditSlayTicketsForOrder, type SlayTicketLineItem } from '../_lib/slayTickets.js';

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseBody(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') {
    try {
      return JSON.parse(b) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (b && typeof b === 'object' && !Array.isArray(b)) return b as Record<string, unknown>;
  return {};
}

function serviceSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * POST /api/slay-tickets/credit-order — credit earned/purchased tickets after checkout.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const user = await getAuthUser(req);
  if (!user) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return;
  }

  const supabase = serviceSupabase();
  if (!supabase) {
    sendJson(res, 503, { error: 'Supabase not configured' });
    return;
  }

  const body = parseBody(req);
  const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
  const lineItems = Array.isArray(body.lineItems) ? (body.lineItems as SlayTicketLineItem[]) : [];
  if (!orderId) {
    sendJson(res, 400, { error: 'orderId required' });
    return;
  }

  try {
    const result = await creditSlayTicketsForOrder(supabase, user.id, { orderId, lineItems });
    if (!result.ok) {
      sendJson(res, 500, { error: result.error || 'Failed to credit tickets' });
      return;
    }
    sendJson(res, 200, { credited: result.credited, balance: result.balance });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    sendJson(res, 500, { error: msg });
  }
}
