/**
 * GET /api/psa/health — lightweight config check (no auth, no OpenAI call).
 * Use after setting OPENAI_API_KEY on Vercel to confirm the deployment picked it up.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (_req.method === 'OPTIONS') return res.status(204).end();
  if (_req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const openaiKey = (process.env.OPENAI_API_KEY || '').trim();
  const model = (process.env.PSA_OPENAI_MODEL || 'gpt-5.4-mini').trim();

  return res.status(200).json({
    openaiConfigured: openaiKey.length > 0,
    model,
    hint: openaiKey.length
      ? 'OPENAI_API_KEY is present on this deployment.'
      : 'OPENAI_API_KEY missing on THIS deployment. Add in Vercel → Settings → Environment Variables for Production + Preview, then Redeploy. .env.local does not apply to fsbw.vercel.app unless you run vercel dev.',
  });
}
