import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { fetchPublicForecastPayload, fetchPublicReportPayload } from '../_lib/trendIntelligence/service.js';

/**
 * GET /api/trend-intelligence/public?editionSlug=... | packId=...
 * Safe public projection — approved/published intelligence only (no demo in prod RPC).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = getSupabaseAdmin();
    const editionSlug = typeof req.query.editionSlug === 'string' ? req.query.editionSlug : undefined;
    const packId = typeof req.query.packId === 'string' ? req.query.packId : undefined;

    if (editionSlug) {
      const payload = await fetchPublicForecastPayload(supabase, editionSlug);
      return res.status(200).json(payload);
    }
    if (packId) {
      const payload = await fetchPublicReportPayload(supabase, packId);
      return res.status(200).json(payload);
    }

    return res.status(400).json({ error: 'Provide editionSlug or packId' });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
