/**
 * GET /api/admin/psa-review — PSA thread transcripts + tool usage (admin only).
 * Query: (none) list recent threads | ?threadId=uuid detail
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import {
  getPsaThreadDetailForAdmin,
  listPsaThreadsForAdminReview,
} from '../_lib/psaToolAnalytics.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const threadId = typeof req.query.threadId === 'string' ? req.query.threadId.trim() : '';

  try {
    if (threadId) {
      const detail = await getPsaThreadDetailForAdmin(threadId);
      if (!detail) return res.status(404).json({ error: 'Thread not found' });
      return res.status(200).json(detail);
    }

    const limit = Math.min(80, Math.max(1, parseInt(String(req.query.limit || '40'), 10)));
    const threads = await listPsaThreadsForAdminReview(limit);
    return res.status(200).json({ threads });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'PSA review failed';
    return res.status(500).json({ error: msg });
  }
}
