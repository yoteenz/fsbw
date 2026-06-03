/**
 * GET /api/psa/health — minimal public config check (no auth).
 * Admin-only detail: ?probe=1 or ?admin=1 with admin Bearer JWT.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';

async function probeOpenAiKey(key: string): Promise<{
  keyStatus: 'valid' | 'invalid' | 'unreachable';
  detail: string;
}> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.status === 401) {
      return { keyStatus: 'invalid', detail: 'OpenAI rejected this key (401).' };
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        keyStatus: 'unreachable',
        detail: `OpenAI returned ${res.status}${text ? `: ${text.slice(0, 120)}` : ''}`,
      };
    }
    return { keyStatus: 'valid', detail: 'Key is valid for OpenAI auth.' };
  } catch {
    return { keyStatus: 'unreachable', detail: 'Could not reach api.openai.com from Vercel.' };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const openaiKey = (process.env.OPENAI_API_KEY || '').trim();
  const model = (process.env.PSA_OPENAI_MODEL || 'gpt-5.4-mini').trim();
  const wantsDetail = req.query?.probe === '1' || req.query?.probe === 'true' || req.query?.admin === '1';

  const publicBody = {
    openaiConfigured: openaiKey.length > 0,
    model,
  };

  if (!wantsDetail) {
    return res.status(200).json(publicBody);
  }

  const admin = await requireAdmin(req);
  if (!admin) {
    return res.status(403).json({ error: 'Admin session required for PSA health probe.' });
  }

  if (!openaiKey) {
    return res.status(200).json({
      ...publicBody,
      probed: false,
      hint: 'OPENAI_API_KEY missing on this deployment.',
    });
  }

  const probeResult = await probeOpenAiKey(openaiKey);
  return res.status(200).json({ ...publicBody, probed: true, ...probeResult });
}
