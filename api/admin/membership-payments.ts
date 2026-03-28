import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { hasSupabaseServiceRole, getSupabaseAdminServiceRole } from '../_lib/supabase';

type PayRow = {
  id: string;
  created_at: string;
  user_email: string | null;
  subscription_tier: string | null;
  amount_usd: number | string;
  kind: string;
  billing_period_end: string | null;
  stripe_invoice_id: string;
};

type FailRow = {
  id: string;
  created_at: string;
  user_email: string | null;
  stripe_invoice_id: string | null;
  stripe_subscription_id: string | null;
  amount_usd: number | string;
  profiles: { subscription_tier: string | null } | null;
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
    const { data: payData, error: payErr } = await supabase
      .from('membership_payments')
      .select(
        'id,created_at,user_email,subscription_tier,amount_usd,kind,billing_period_end,stripe_invoice_id'
      )
      .order('created_at', { ascending: false })
      .limit(500);

    if (payErr) {
      console.error('[admin/membership-payments]', payErr);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: payErr.message }));
      return;
    }

    const payRows = (Array.isArray(payData) ? payData : []) as PayRow[];
    const successPayments = payRows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      userEmail: r.user_email ?? '',
      subscriptionTier: r.subscription_tier ?? '',
      amountUsd: typeof r.amount_usd === 'string' ? parseFloat(r.amount_usd) : Number(r.amount_usd),
      autoRenew: false,
      kind: (r.kind === 'renewal' ? 'renewal' : 'initial') as 'initial' | 'renewal',
      nextBillingAt: r.billing_period_end ?? undefined,
      externalId: r.stripe_invoice_id,
      source: 'supabase' as const,
    }));

    let failPayments: typeof successPayments = [];
    const { data: failData, error: failErr } = await supabase
      .from('membership_payment_failures')
      .select('id,created_at,user_email,stripe_invoice_id,stripe_subscription_id,amount_usd,profiles(subscription_tier)')
      .order('created_at', { ascending: false })
      .limit(300);

    if (!failErr && Array.isArray(failData)) {
      failPayments = (failData as FailRow[]).map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        userEmail: r.user_email ?? '',
        subscriptionTier: r.profiles?.subscription_tier ?? '',
        amountUsd: typeof r.amount_usd === 'string' ? parseFloat(r.amount_usd) : Number(r.amount_usd),
        autoRenew: false,
        kind: 'failed' as const,
        nextBillingAt: undefined,
        externalId: r.stripe_invoice_id ?? undefined,
        source: 'supabase' as const,
      }));
    } else if (failErr) {
      console.error('[admin/membership-payments] failures', failErr);
    }

    const payments = [...successPayments, ...failPayments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

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
