/**
 * GET /api/psa/threads — list past PSA chat sessions for the signed-in member.
 * POST /api/psa/threads — start a new empty chat session.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getPsaPremiumProfile } from '../_lib/psaPremiumCheck.js';
import {
  createPsaThread,
  isPsaThreadStoreConfigured,
  listPsaThreads,
} from '../_lib/psaThreadStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
    return res.status(503).json({
      error: 'PSA chat history is not configured on the server. Run migration 20260606120000_psa_chat_threads.sql.',
      code: 'PSA_THREADS_UNAVAILABLE',
    });
  }

  try {
    if (req.method === 'GET') {
      const threads = await listPsaThreads(user.id);
      return res.status(200).json({ threads });
    }

    if (req.method === 'POST') {
      const thread = await createPsaThread(user.id);
      return res.status(201).json({
        threadId: thread.id,
        createdAt: thread.created_at,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'PSA threads failed';
    console.error('[psa/threads]', msg);
    return res.status(500).json({ error: msg });
  }
}
