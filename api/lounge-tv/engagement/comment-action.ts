import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '../../_lib/auth.js';
import { isAdminEmail } from '../../_lib/adminAuth.js';
import { deleteComment, moderateComment, reportComment } from '../../_lib/loungeEngagement.js';

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
 * POST /api/lounge-tv/engagement/comment-action
 * Body: { commentId, action: 'delete' | 'report' | 'pin' | 'unpin' | 'official' | 'hide' }
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
  const commentId = String(body.commentId ?? '').trim();
  const action = String(body.action ?? '').trim();

  if (!commentId || !action) {
    sendJson(res, 400, { error: 'commentId and action required' });
    return;
  }

  try {
    if (action === 'delete') {
      await deleteComment(supabase, user.id, user.email, commentId, isAdminEmail(user.email));
      sendJson(res, 200, { ok: true });
      return;
    }

    if (action === 'report') {
      await reportComment(supabase, user.id, commentId);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (['pin', 'unpin', 'official', 'hide'].includes(action)) {
      if (!isAdminEmail(user.email)) {
        sendJson(res, 403, { error: 'Admin required' });
        return;
      }
      await moderateComment(supabase, user.email, {
        commentId,
        action: action as 'pin' | 'unpin' | 'official' | 'hide',
      });
      sendJson(res, 200, { ok: true });
      return;
    }

    sendJson(res, 400, { error: 'Unknown action' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Action failed';
    const status = msg === 'forbidden' ? 403 : msg === 'not_found' ? 404 : 500;
    sendJson(res, status, { error: msg });
  }
}
