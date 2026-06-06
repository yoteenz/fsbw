export const config = { maxDuration: 30 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth.js';
import { pollStudioTryOnRender } from './_lib/liveTryOnStudio.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = await getAuthUser(req);
  if (!user?.id) {
    res.status(401).json({ error: 'Sign in required' });
    return;
  }

  const jobId = typeof req.query.jobId === 'string' ? req.query.jobId.trim() : '';
  if (!jobId) {
    res.status(400).json({ error: 'jobId is required' });
    return;
  }

  try {
    const result = await pollStudioTryOnRender(user.id, jobId);
    res.status(200).json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Status check failed';
    res.status(500).json({ error: msg });
  }
}
