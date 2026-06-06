export const config = { maxDuration: 30 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth.js';
import { startStudioMakeupRender } from './_lib/liveTryOnStudio.js';

function parseBody(req: VercelRequest): Record<string, unknown> {
  const body = req.body;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (body && typeof body === 'object' && !Array.isArray(body)) return body as Record<string, unknown>;
  return {};
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = await getAuthUser(req);
  if (!user?.id) {
    res.status(401).json({ error: 'Sign in required for Studio Try-On' });
    return;
  }

  const body = parseBody(req);
  const jobId = typeof body.jobId === 'string' ? body.jobId.trim() : '';
  if (!jobId) {
    res.status(400).json({ error: 'jobId is required' });
    return;
  }

  try {
    const result = await startStudioMakeupRender(user.id, jobId);
    res.status(200).json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Studio makeup render failed';
    res.status(500).json({ error: msg });
  }
}
