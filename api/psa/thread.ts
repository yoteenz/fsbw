/**
 * GET /api/psa/thread — load the active (latest) or a specific PSA chat thread + messages.
 *
 * Query:
 *   (none) — latest thread for member
 *   ?threadId=uuid — specific thread
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getPsaPremiumProfile } from '../_lib/psaPremiumCheck.js';
import {
  getLatestPsaThread,
  getPsaThreadForUser,
  getPsaThreadMessages,
  isPsaThreadStoreConfigured,
} from '../_lib/psaThreadStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    return res.status(200).json({
      threadId: null,
      lastResponseId: null,
      messages: [],
      historyAvailable: false,
    });
  }

  try {
    const threadIdParam =
      typeof req.query.threadId === 'string' && req.query.threadId.trim()
        ? req.query.threadId.trim()
        : null;

    const thread = threadIdParam
      ? await getPsaThreadForUser(user.id, threadIdParam)
      : await getLatestPsaThread(user.id);

    if (!thread) {
      return res.status(200).json({
        threadId: null,
        lastResponseId: null,
        messages: [],
        historyAvailable: true,
      });
    }

    const rows = await getPsaThreadMessages(thread.id);

    return res.status(200).json({
      threadId: thread.id,
      title: thread.title,
      lastResponseId: thread.last_openai_response_id,
      updatedAt: thread.updated_at,
      historyAvailable: true,
      messages: rows.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'PSA thread load failed';
    console.error('[psa/thread]', msg);
    return res.status(500).json({ error: msg });
  }
}
