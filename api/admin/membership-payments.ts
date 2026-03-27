import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { hasSupabaseServiceRole, getSupabaseAdminServiceRole } from '../_lib/supabase';

type Row = {
  id: string;
  created_at: string;
  user_email: string | null;
  subscription_tier: string | null;
  amount_usd: number | string;
  kind: string;
  billing_period_end: string | null;
  stripe_invoice_id: string;
};

/** GET /api/admin/membership-payments — admin session; requires service role for full table read. */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const admin = await requireAdmin(req);
  if (!admin) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Forbidden' }));
    return;
  }

  if (!hasSupabaseServiceRole()) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY required for membership payments list' }));
    return;
  }

  try {
    const supabase = getSupabaseAdminServiceRole();
    const { data, error } = await supabase
      .from('membership_payments')
      .select(
        'id,created_at,user_email,subscription_tier,amount_usd,kind,billing_period_end,stripe_invoice_id'
      )
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error('[admin/membership-payments]', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: error.message }));
      return;
    }

    const rows = (Array.isArray(data) ? data : []) as Row[];
    const payments = rows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      userEmail: r.user_email ?? '',
      subscriptionTier: r.subscription_tier ?? '',
      amountUsd: typeof r.amount_usd === 'string' ? parseFloat(r.amount_usd) : Number(r.amount_usd),
      autoRenew: false,
      kind: r.kind === 'renewal' ? 'renewal' : 'initial',
      nextBillingAt: r.billing_period_end ?? undefined,
      externalId: r.stripe_invoice_id,
      source: 'supabase' as const,
    }));

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ payments }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: msg }));
  }
}
