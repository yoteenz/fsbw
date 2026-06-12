import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getAuthUser } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { hairstyleAnalysisGrantsFromQuoteLines } from '../_lib/hairstyleAnalysisCheckoutGrants.js';
import { resolveCheckoutQuoteLines, type QuoteLineInput } from '../_lib/pricing/resolveQuote.js';

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

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

function sanitizeStripeId(raw: unknown, maxLen = 120): string {
  return String(raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, maxLen);
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(key);
}

/**
 * POST /api/stripe/create-product-payment-intent
 * Body: { lines: QuoteLineInput[] } — same shape as /api/checkout/quote.
 * Amount is always recomputed server-side (USD, cents).
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const user = await getAuthUser(req);
  if (!user) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return;
  }

  const body = parseBody(req);
  const raw = body.lines;
  if (!Array.isArray(raw) || raw.length === 0) {
    sendJson(res, 400, { error: 'Expected { lines: [...] } with at least one line' });
    return;
  }

  const lines: QuoteLineInput[] = raw.map((x) => {
    const o = x && typeof x === 'object' && !Array.isArray(x) ? (x as Record<string, unknown>) : {};
    return {
      id: typeof o.id === 'string' ? o.id : undefined,
      name: typeof o.name === 'string' ? o.name : '',
      quantity: typeof o.quantity === 'number' && !Number.isNaN(o.quantity) ? o.quantity : 1,
      type: typeof o.type === 'string' ? o.type : undefined,
      bookingInstallKind: typeof o.bookingInstallKind === 'string' ? o.bookingInstallKind : undefined,
      bookingStyle: typeof o.bookingStyle === 'string' ? o.bookingStyle : undefined,
      bookingAddonIds: Array.isArray(o.bookingAddonIds)
        ? (o.bookingAddonIds as unknown[]).filter((a): a is string => typeof a === 'string')
        : undefined,
      bcfBundleDeal: o.bcfBundleDeal === true,
      bcfBundleDealListSubtotal:
        typeof o.bcfBundleDealListSubtotal === 'number' ? o.bcfBundleDealListSubtotal : undefined,
      capSize: typeof o.capSize === 'string' ? o.capSize : undefined,
      consultStyleAnalysisComparisonCount:
        o.consultStyleAnalysisComparisonCount === 1 ||
        o.consultStyleAnalysisComparisonCount === 3 ||
        o.consultStyleAnalysisComparisonCount === 6
          ? o.consultStyleAnalysisComparisonCount
          : undefined,
      hairstyleAnalysisComparisonCount:
        o.hairstyleAnalysisComparisonCount === 1 ||
        o.hairstyleAnalysisComparisonCount === 3 ||
        o.hairstyleAnalysisComparisonCount === 6
          ? o.hairstyleAnalysisComparisonCount
          : undefined,
    };
  });

  const quote = resolveCheckoutQuoteLines(lines);
  const hairstyleAnalysisGrants = hairstyleAnalysisGrantsFromQuoteLines(lines);
  if (!quote.fullyResolved) {
    sendJson(res, 400, {
      error: 'Cart contains lines that cannot be priced server-side yet.',
      quote,
      hint: 'Complete server catalog or remove BCF/unresolved items.'
    });
    return;
  }

  if (quote.totalCents <= 0) {
    sendJson(res, 400, { error: 'Total must be greater than zero' });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    sendJson(res, 503, { error: 'Stripe is not configured' });
    return;
  }

  try {
    const stripe = getStripe();
    const savePaymentMethodForFuture = body.savePaymentMethodForFuture === true;
    const stripeCustomerIdFromBody = sanitizeStripeId(body.stripeCustomerId, 120);
    let stripeCustomerId = stripeCustomerIdFromBody || '';
    if (savePaymentMethodForFuture) {
      const supabase = getSupabaseAdmin();
      if (!stripeCustomerId) {
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('stripe_customer_id,email')
          .eq('id', user.id)
          .maybeSingle();
        if (profErr) {
          sendJson(res, 500, { error: profErr.message });
          return;
        }
        stripeCustomerId = String((prof as { stripe_customer_id?: string | null } | null)?.stripe_customer_id || '').trim();
      }
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { supabase_user_id: user.id },
        });
        stripeCustomerId = customer.id;
      }
      if (stripeCustomerId) {
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }
    }
    const pi = await stripe.paymentIntents.create({
      amount: quote.totalCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      ...(savePaymentMethodForFuture ? { setup_future_usage: 'off_session' as const } : {}),
      ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
      metadata: {
        purpose: 'product_order',
        supabase_user_id: user.id,
        user_email: user.email || '',
        computed_total_cents: String(quote.totalCents),
        line_count: String(lines.length),
        booking_autopay_enroll: savePaymentMethodForFuture ? 'true' : 'false',
        ...(hairstyleAnalysisGrants.length > 0
          ? { hairstyle_analysis_grants: JSON.stringify(hairstyleAnalysisGrants) }
          : {}),
      }
    });

    sendJson(res, 200, {
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
      stripeCustomerId: stripeCustomerId || null,
      quote
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Stripe error';
    sendJson(res, 500, { error: msg });
  }
}
