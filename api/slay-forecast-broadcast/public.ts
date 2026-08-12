import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { fetchPublicBroadcastPackage } from '../_lib/slayForecastBroadcast/packages.js';

/**
 * GET /api/slay-forecast-broadcast/public?editionSlug=...
 * Published broadcast packages only — no draft/generating assets.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const editionSlug = typeof req.query.editionSlug === 'string' ? req.query.editionSlug : undefined;
    if (!editionSlug) return res.status(400).json({ error: 'Provide editionSlug' });

    const supabase = getSupabaseAdmin();
    const payload = await fetchPublicBroadcastPackage(supabase, editionSlug);
    return res.status(200).json(payload);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
