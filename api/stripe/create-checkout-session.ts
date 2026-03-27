import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getAuthUser } from '../_lib/auth';
import { getSupabaseAdmin } from '../_lib/supabase';
import {
  isMembershipTierParam,
  siteUrlFromEnv,
  stripePriceIdForTier,
  membershipStripeConfigured,
} from '../_lib/stripeMembership';

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseJsonBody(req: VercelRequest): Record<string, unknown> {
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

/**
 * POST /api/stripe/create-checkout-session
 * Body: { tier: '3months' | '6months' | '12months', returnPath?: string } — returnPath must start with /
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

  if (!membershipStripeConfigured()) {
    sendJson(res, 503, { error: 'Stripe membership is not configured' });
    return;
  }

  const secret = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!secret) {
    sendJson(res, 503, { error: 'Missing STRIPE_SECRET_KEY' });
    return;
  }

  const site = siteUrlFromEnv();
  if (!site) {
    sendJson(res, 503, { error: 'Set SITE_URL (e.g. https://your-app.vercel.app) for checkout redirects' });
    return;
  }

  const body = parseJsonBody(req);
  const tierRaw = body.tier;
  if (!isMembershipTierParam(tierRaw)) {
    sendJson(res, 400, { error: 'Invalid tier' });
    return;
  }
  const priceId = stripePriceIdForTier(tierRaw);
  if (!priceId) {
    sendJson(res, 503, { error: 'Missing Stripe price id for tier' });
    return;
  }

  let returnPath = typeof body.returnPath === 'string' ? body.returnPath.trim() : '/account/membership';
  if (!returnPath.startsWith('/') || returnPath.startsWith('//')) {
    returnPath = '/account/membership';
  }
  const sep = returnPath.includes('?') ? '&' : '?';
  const successUrl = `${site}${returnPath}${sep}stripe=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${site}${returnPath}${sep}stripe=cancel`;

  const stripe = new Stripe(secret);

  try {
    const supabase = getSupabaseAdmin();
    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('stripe_customer_id,email')
      .eq('id', user.id)
      .maybeSingle();

    if (profErr) {
      console.error('[create-checkout-session] profile select', profErr);
      sendJson(res, 500, { error: profErr.message });
      return;
    }

    let customerId = (prof as { stripe_customer_id?: string | null } | null)?.stripe_customer_id?.trim() || null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      const { error: upErr } = await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (upErr) {
        console.error('[create-checkout-session] save customer id', upErr);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user.id,
      metadata: {
        supabase_user_id: user.id,
        subscription_tier: tierRaw,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          subscription_tier: tierRaw,
        },
      },
    });

    if (!session.url) {
      sendJson(res, 500, { error: 'Checkout session missing redirect URL' });
      return;
    }

    sendJson(res, 200, { url: session.url, sessionId: session.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Stripe error';
    console.error('[create-checkout-session]', e);
    sendJson(res, 500, { error: msg });
  }
}
