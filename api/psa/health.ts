/**
 * GET /api/psa/health — config check (no auth).
 * ?probe=1 — also calls OpenAI GET /v1/models to verify the key is recognized (no chat cost).
 * Use keyFingerprint to match the key in Vercel vs platform.openai.com/api-keys.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

function keyFingerprint(key: string): string | null {
  if (key.length < 12) return null;
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

async function probeOpenAiKey(key: string): Promise<{
  keyStatus: 'valid' | 'invalid' | 'unreachable';
  detail: string;
}> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.status === 401) {
      return { keyStatus: 'invalid', detail: 'OpenAI rejected this key (401). Replace OPENAI_API_KEY in Vercel.' };
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        keyStatus: 'unreachable',
        detail: `OpenAI returned ${res.status}${text ? `: ${text.slice(0, 120)}` : ''}`,
      };
    }
    return {
      keyStatus: 'valid',
      detail:
        'Key is valid for OpenAI auth. If chat still says quota exceeded, credits are on a different org than this key — create a new key while the credited org is selected.',
    };
  } catch {
    return { keyStatus: 'unreachable', detail: 'Could not reach api.openai.com from Vercel.' };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const openaiKey = (process.env.OPENAI_API_KEY || '').trim();
  const model = (process.env.PSA_OPENAI_MODEL || 'gpt-5.4-mini').trim();
  const probe = req.query?.probe === '1' || req.query?.probe === 'true';

  const base = {
    openaiConfigured: openaiKey.length > 0,
    keyFingerprint: keyFingerprint(openaiKey),
    model,
    hint: openaiKey.length
      ? 'Compare keyFingerprint with the key shown at platform.openai.com/api-keys (same org must have billing/credits). Usage: platform.openai.com/usage — if PSA requests do not appear, Vercel is using a different key/org.'
      : 'OPENAI_API_KEY missing on THIS deployment. Add in Vercel → Settings → Environment Variables for Production + Preview, then Redeploy.',
  };

  if (!probe || !openaiKey) {
    return res.status(200).json({ ...base, probed: false });
  }

  const probeResult = await probeOpenAiKey(openaiKey);
  return res.status(200).json({ ...base, probed: true, ...probeResult });
}
