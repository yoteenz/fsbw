/**
 * GET /api/psa/thread — load active or specific PSA thread + messages.
 * PATCH /api/psa/thread — archive, unarchive, or rename a thread.
 * DELETE /api/psa/thread — permanently delete a thread (?threadId=).
 *
 * Query:
 *   (none) — latest non-archived thread
 *   ?threadId=uuid — specific thread
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getPsaPremiumProfile } from '../_lib/psaPremiumCheck.js';
import { refreshPsaMemberContext } from '../_lib/psaMemberContext.js';
import {
  archivePsaThread,
  deletePsaThread,
  getLatestPsaThread,
  getPsaThreadForUser,
  getPsaThreadMessages,
  isPsaThreadStoreConfigured,
  renamePsaThread,
  unarchivePsaThread,
} from '../_lib/psaThreadStore.js';

const CONTINUE_HINT_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', code: 'SIGN_IN_REQUIRED' });
  }

  const premium = await getPsaPremiumProfile(user.id, user.accessToken, user.email);
  if (!premium?.isPremium) {
    return res.status(403).json({
      error: 'Premium membership required for PSA.',
      code: 'PREMIUM_REQUIRED',
    });
  }

  if (!isPsaThreadStoreConfigured()) {
    if (req.method === 'GET') {
      return res.status(200).json({
        threadId: null,
        lastResponseId: null,
        messages: [],
        historyAvailable: false,
      });
    }
    return res.status(503).json({
      error: 'PSA chat history is not configured on the server.',
      code: 'PSA_THREADS_UNAVAILABLE',
    });
  }

  const threadIdParam =
    typeof req.query.threadId === 'string' && req.query.threadId.trim()
      ? req.query.threadId.trim()
      : typeof (req.body as { threadId?: string })?.threadId === 'string'
        ? (req.body as { threadId: string }).threadId.trim()
        : null;

  try {
    if (req.method === 'DELETE') {
      if (!threadIdParam) {
        return res.status(400).json({ error: 'threadId required.' });
      }
      const deleted = await deletePsaThread(user.id, threadIdParam);
      if (!deleted) return res.status(404).json({ error: 'Thread not found.' });
      return res.status(200).json({ ok: true, deleted: threadIdParam });
    }

    if (req.method === 'PATCH') {
      if (!threadIdParam) {
        return res.status(400).json({ error: 'threadId required.' });
      }
      const body = (req.body ?? {}) as { archive?: boolean; unarchive?: boolean; title?: string };
      if (typeof body.title === 'string' && body.title.trim()) {
        const ok = await renamePsaThread(user.id, threadIdParam, body.title);
        if (!ok) return res.status(404).json({ error: 'Thread not found.' });
        return res.status(200).json({ ok: true, threadId: threadIdParam, title: body.title.trim() });
      }
      if (body.unarchive === true) {
        const ok = await unarchivePsaThread(user.id, threadIdParam);
        if (!ok) return res.status(404).json({ error: 'Thread not found.' });
        return res.status(200).json({ ok: true, threadId: threadIdParam, archived: false });
      }
      const ok = await archivePsaThread(user.id, threadIdParam);
      if (!ok) return res.status(404).json({ error: 'Thread not found.' });
      return res.status(200).json({ ok: true, threadId: threadIdParam, archived: true });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    let memberContext = null;
    try {
      memberContext = await refreshPsaMemberContext({
        userId: user.id,
        accessToken: user.accessToken,
        premium,
      });
    } catch (ctxErr) {
      console.warn('[psa/thread] member context refresh', ctxErr);
    }

    const thread = threadIdParam
      ? await getPsaThreadForUser(user.id, threadIdParam)
      : await getLatestPsaThread(user.id, true);

    if (!thread) {
      return res.status(200).json({
        threadId: null,
        lastResponseId: null,
        messages: [],
        historyAvailable: true,
        memberContext,
      });
    }

    const rows = await getPsaThreadMessages(thread.id);
    const hasUserMessages = rows.some((m) => m.role === 'user');
    if (!hasUserMessages) {
      await deletePsaThread(user.id, thread.id);
      return res.status(200).json({
        threadId: null,
        lastResponseId: null,
        messages: [],
        historyAvailable: true,
        memberContext,
      });
    }

    const updatedAtMs = new Date(thread.updated_at).getTime();
    const continueHint =
      Date.now() - updatedAtMs <= CONTINUE_HINT_MAX_AGE_MS
        ? {
            threadId: thread.id,
            title: thread.title?.trim() || rows.find((m) => m.role === 'user')?.content?.slice(0, 72) || 'PSA CHAT',
            messageCount: rows.length,
            updatedAt: thread.updated_at,
          }
        : null;

    return res.status(200).json({
      threadId: thread.id,
      title: thread.title,
      lastResponseId: thread.last_openai_response_id,
      updatedAt: thread.updated_at,
      archived: Boolean(thread.archived_at),
      threadSummary: thread.thread_summary,
      historyAvailable: true,
      continueHint,
      memberContext,
      messages: rows.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'PSA thread failed';
    console.error('[psa/thread]', msg);
    return res.status(500).json({ error: msg });
  }
}
