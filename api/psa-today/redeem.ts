import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '../_lib/auth.js';
import { redeemPsaEpisodeEntitlement } from '../_lib/psaEntitlements.js';

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

/** POST /api/psa-today/redeem */
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
  const episodeId = typeof body.episodeId === 'string' ? body.episodeId.trim() : '';
  const contentId = typeof body.contentId === 'string' ? body.contentId.trim() : '';
  const ticketCost = Math.max(0, Math.floor(Number(body.ticketCost) || 0));
  const contentTitle = typeof body.contentTitle === 'string' ? body.contentTitle : undefined;
  const includedWatches = body.includedWatches != null ? Math.floor(Number(body.includedWatches)) : undefined;
  const accessDurationYears =
    body.accessDurationYears != null ? Math.floor(Number(body.accessDurationYears)) : undefined;

  if (!episodeId || !contentId) {
    sendJson(res, 400, { error: 'episodeId and contentId required' });
    return;
  }

  try {
    const result = await redeemPsaEpisodeEntitlement(supabase, user.id, {
      episodeId,
      contentId,
      ticketCost,
      contentTitle,
      includedWatches,
      accessDurationYears,
    });
    if (!result.ok) {
      sendJson(res, result.error === 'Insufficient Slay Tickets' ? 402 : 500, {
        error: result.error,
        balance: result.balance,
      });
      return;
    }
    sendJson(res, 200, {
      balance: result.balance,
      entitlement: result.entitlement,
      alreadyActive: result.alreadyActive ?? false,
    });
  } catch (e) {
    sendJson(res, 500, { error: e instanceof Error ? e.message : 'Internal error' });
  }
}
