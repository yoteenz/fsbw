import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '../../_lib/auth.js';
import {
  createComment,
  listComments,
  mapCommentForClient,
  type LoungeEngagementContentType,
} from '../../_lib/loungeEngagement.js';

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
 * GET /api/lounge-tv/engagement/comments?contentType=&contentId=&cursor=
 * POST /api/lounge-tv/engagement/comments — create top-level comment or reply (auth required).
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const supabase = serviceSupabase();
  if (!supabase) {
    sendJson(res, 503, { error: 'Supabase not configured' });
    return;
  }

  if (req.method === 'GET') {
    const contentType = String(req.query.contentType ?? '').trim() as LoungeEngagementContentType;
    const contentId = String(req.query.contentId ?? '').trim();
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : null;
    const limit = Math.min(60, Math.max(1, Math.floor(Number(req.query.limit) || 40)));

    if (!contentType || !contentId) {
      sendJson(res, 400, { error: 'contentType and contentId required' });
      return;
    }

    try {
      const user = await getAuthUser(req);
      const { comments, nextCursor } = await listComments(supabase, contentType, contentId, limit, cursor);
      sendJson(res, 200, {
        comments: comments.map((c) => mapCommentForClient(c, user?.id ?? null)),
        nextCursor,
      });
    } catch (err) {
      sendJson(res, 500, { error: err instanceof Error ? err.message : 'Failed to load comments' });
    }
    return;
  }

  if (req.method === 'POST') {
    const user = await getAuthUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const body = parseBody(req);
    const contentType = String(body.contentType ?? '').trim() as LoungeEngagementContentType;
    const contentId = String(body.contentId ?? '').trim();
    const commentBody = String(body.body ?? '');
    const parentId = typeof body.parentId === 'string' ? body.parentId : null;

    if (!contentType || !contentId) {
      sendJson(res, 400, { error: 'contentType and contentId required' });
      return;
    }

    try {
      const row = await createComment(supabase, user.id, {
        contentType,
        contentId,
        body: commentBody,
        parentId,
      });
      sendJson(res, 201, { comment: mapCommentForClient(row, user.id) });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create comment';
      const status = msg === 'rate_limited' ? 429 : msg.startsWith('invalid') ? 400 : 500;
      sendJson(res, status, { error: msg });
    }
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
}
