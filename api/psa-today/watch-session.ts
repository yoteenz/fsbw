import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '../_lib/auth.js';
import {
  closePsaWatchSession,
  startPsaWatchSession,
  syncPsaWatchSessionProgress,
} from '../_lib/psaEntitlements.js';

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
 * POST /api/psa-today/watch-session — start session
 * PATCH /api/psa-today/watch-session — sync progress / consume watch
 * DELETE /api/psa-today/watch-session — close session
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
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

  try {
    if (req.method === 'POST') {
      const episodeId = typeof body.episodeId === 'string' ? body.episodeId.trim() : '';
      const entitlementId = typeof body.entitlementId === 'string' ? body.entitlementId.trim() : '';
      const threshold = Math.max(0, Number(body.qualificationThresholdSeconds) || 0);
      if (!episodeId || !entitlementId) {
        sendJson(res, 400, { error: 'episodeId and entitlementId required' });
        return;
      }
      const session = await startPsaWatchSession(supabase, user.id, {
        episodeId,
        entitlementId,
        qualificationThresholdSeconds: threshold,
      });
      sendJson(res, 200, { session });
      return;
    }

    if (req.method === 'PATCH') {
      const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
      const actualWatchedSeconds = Math.max(0, Number(body.actualWatchedSeconds) || 0);
      const consumeIfQualified = body.consumeIfQualified === true;
      if (!sessionId) {
        sendJson(res, 400, { error: 'sessionId required' });
        return;
      }
      const result = await syncPsaWatchSessionProgress(supabase, user.id, {
        sessionId,
        actualWatchedSeconds,
        consumeIfQualified,
      });
      sendJson(res, 200, result);
      return;
    }

    if (req.method === 'DELETE') {
      const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
      if (!sessionId) {
        sendJson(res, 400, { error: 'sessionId required' });
        return;
      }
      const session = await closePsaWatchSession(supabase, user.id, sessionId);
      sendJson(res, 200, { session });
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    sendJson(res, 500, { error: e instanceof Error ? e.message : 'Internal error' });
  }
}
