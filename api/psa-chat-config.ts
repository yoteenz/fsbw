import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_lib/supabase.js';

const CONFIG_KEY = 'psa_chat_copy_admin';

/**
 * GET /api/psa-chat-config — public read of admin-edited PSA chat copy JSON.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('app_config').select('value').eq('key', CONFIG_KEY).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    const value = data?.value;
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      return res.status(200).json({ config: value });
    }
    return res.status(200).json({ config: null });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
