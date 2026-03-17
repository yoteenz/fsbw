import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/auth-diagnostic – log auth state from the client (no auth required).
 * Used to debug Safari sign-out: client sends snapshot on load and on visibility hidden.
 * Check Vercel logs (Deployments → Function Logs) to see what state the client had after reopen.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const payload = {
    ts: Date.now(),
    ...body,
  };
  // Log so it appears in Vercel Function Logs (Deployments → your deployment → Logs)
  console.log('[auth-diagnostic]', JSON.stringify(payload));
  return res.status(204).end();
}
