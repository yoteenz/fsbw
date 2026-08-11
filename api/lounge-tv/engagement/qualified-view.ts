import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '../../_lib/auth.js';
import { recordQualifiedView, type LoungeEngagementContentType } from '../../_lib/loungeEngagement.js';

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
 * POST /api/lounge-tv/engagement/qualified-view
 * Records an engagement qualified view (separate from PSA access watch consumption).
 *
 * Dedup: one qualified view per viewer per content per 7-day window.
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

  const supabase = serviceSupabase();
  if (!supabase) {
    sendJson(res, 503, { error: 'Supabase not configured' });
    return;
  }

  const body = parseBody(req);
  const contentType = String(body.contentType ?? '').trim() as LoungeEngagementContentType;
  const contentId = String(body.contentId ?? '').trim();
  const watchSeconds = Math.max(0, Math.floor(Number(body.watchSeconds) || 0));
  const durationSeconds = Math.max(0, Math.floor(Number(body.durationSeconds) || 0));
  const viewerKey = typeof body.viewerKey === 'string' ? body.viewerKey.trim().slice(0, 128) : null;

  if (!contentType || !contentId) {
    sendJson(res, 400, { error: 'contentType and contentId required' });
    return;
  }

  const user = await getAuthUser(req);

  try {
    const result = await recordQualifiedView(supabase, {
      contentType,
      contentId,
      watchSeconds,
      durationSeconds,
      userId: user?.id ?? null,
      viewerKey: user ? null : viewerKey,
    });
    sendJson(res, 200, result);
  } catch (err) {
    sendJson(res, 500, { error: err instanceof Error ? err.message : 'Failed to record view' });
  }
}
