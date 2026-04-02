import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth';
import { getSupabaseAdmin } from '../_lib/supabase';

function parseBody(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') {
    try {
      const p = JSON.parse(b) as unknown;
      return p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (b && typeof b === 'object' && !Array.isArray(b)) return b as Record<string, unknown>;
  return {};
}

/** POST /api/checkout/redeem-consult-code — body { quoteId } — marks quote redeemed (after paid order). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = parseBody(req);
  const quoteId = String(body.quoteId || body.quote_id || '').trim();
  if (!quoteId) return res.status(400).json({ error: 'quoteId required' });

  try {
    const supabase = getSupabaseAdmin();
    const { data: row, error: fetchErr } = await supabase
      .from('consult_quotes')
      .select('id, user_id, redeemed_at')
      .eq('id', quoteId)
      .maybeSingle();

    if (fetchErr) return res.status(500).json({ error: fetchErr.message });
    if (!row || (row as { user_id: string }).user_id !== user.id) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    if ((row as { redeemed_at?: string | null }).redeemed_at) {
      return res.status(200).json({ ok: true, alreadyRedeemed: true });
    }

    const { error: updErr } = await supabase
      .from('consult_quotes')
      .update({ redeemed_at: new Date().toISOString() })
      .eq('id', quoteId)
      .eq('user_id', user.id);

    if (updErr) return res.status(500).json({ error: updErr.message });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
