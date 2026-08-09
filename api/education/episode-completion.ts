import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '../_lib/auth.js';
import { upsertEpisodeCompletion } from '../_lib/educationCertifications.js';

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function serviceSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
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

/** POST /api/education/episode-completion — sync single episode completion to server */
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
  const episodeRefId = typeof body.episodeRefId === 'string' ? body.episodeRefId.trim() : '';
  const episodeType =
    body.episodeType === 'care-lesson' ? 'care-lesson' : body.episodeType === 'psa-today' ? 'psa-today' : null;
  const seasonId = typeof body.seasonId === 'string' ? body.seasonId.trim() : undefined;

  if (!episodeRefId || !episodeType) {
    sendJson(res, 400, { error: 'episodeRefId and episodeType required' });
    return;
  }

  try {
    await upsertEpisodeCompletion(supabase, user.id, {
      episodeRefId,
      episodeType,
      seasonId,
    });
    sendJson(res, 200, { ok: true });
  } catch (e) {
    sendJson(res, 500, { error: e instanceof Error ? e.message : 'Internal error' });
  }
}
