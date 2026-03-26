import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from './_lib/supabase';

const CONFIG_KEY = 'special_offer_admin';

/**
 * GET /api/special-offer-config — public read of admin special-offer card JSON (concierge, no auth).
 * Returns { config: object | null }.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('app_config').select('value').eq('key', CONFIG_KEY).maybeSingle();
    if (error) {
      console.error('[special-offer-config] Supabase error:', error.message);
      return res.status(500).json({ config: null, error: error.message });
    }
    const value = data?.value;
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      return res.status(200).json({ config: value });
    }
    return res.status(200).json({ config: null });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    console.error('[special-offer-config] Uncaught:', e);
    if (/SUPABASE|Missing/i.test(msg)) {
      return res.status(503).json({ config: null, error: msg });
    }
    return res.status(500).json({ config: null, error: msg });
  }
}
