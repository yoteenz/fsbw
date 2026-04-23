import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';

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

/** POST /api/checkout/validate-consult-code — body { code } — owner, not expired, not redeemed. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = parseBody(req);
  const code = String(body.code || '').trim().toUpperCase();
  if (!code || !/^CONSULT-/i.test(code)) {
    return res.status(400).json({ error: 'Invalid consult code' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('consult_quotes')
      .select('id, discount_code, discount_amount_usd, expires_at, redeemed_at')
      .eq('user_id', user.id)
      .eq('discount_code', code)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Code not found for this account' });

    const redeemed = (data as { redeemed_at?: string | null }).redeemed_at;
    if (redeemed) return res.status(410).json({ error: 'This code has already been used' });

    const expiresAt = (data as { expires_at?: string }).expires_at;
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      return res.status(410).json({ error: 'This code has expired' });
    }

    const amount = Number((data as { discount_amount_usd?: number }).discount_amount_usd) || 40;
    return res.status(200).json({
      ok: true,
      quoteId: (data as { id: string }).id,
      code: (data as { discount_code: string }).discount_code,
      amountUsd: amount,
      expiresAt: expiresAt ?? null,
    });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
