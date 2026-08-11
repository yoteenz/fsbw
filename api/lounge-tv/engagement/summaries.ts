import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '../../_lib/auth.js';
import {
  fetchEngagementSummaries,
  normalizeEngagementItem,
  type LoungeEngagementContentType,
} from '../../_lib/loungeEngagement.js';

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

/**
 * GET /api/lounge-tv/engagement/summaries?items=content_pack:id,content_pack:id2
 * Batch engagement summaries for card rails (avoids N+1).
 */
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

  const supabase = serviceSupabase();
  if (!supabase) {
    sendJson(res, 503, { error: 'Supabase not configured' });
    return;
  }

  const rawItems = String(req.query.items ?? '').trim();
  const parsed = rawItems
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeEngagementItem)
    .filter((x): x is { contentType: LoungeEngagementContentType; contentId: string } => x != null);

  if (!parsed.length) {
    sendJson(res, 400, { error: 'items query required (type:id,type:id)' });
    return;
  }

  if (parsed.length > 80) {
    sendJson(res, 400, { error: 'Too many items (max 80)' });
    return;
  }

  try {
    const user = await getAuthUser(req);
    const summaries = await fetchEngagementSummaries(supabase, parsed, user?.id ?? null);
    sendJson(res, 200, { summaries });
  } catch (err) {
    sendJson(res, 500, { error: err instanceof Error ? err.message : 'Failed to load summaries' });
  }
}
