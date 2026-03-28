import Stripe from 'stripe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
}

function getServiceSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey);
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, stripe: Stripe): Promise<void> {
  if (session.mode !== 'subscription') return;
  const userId = session.metadata?.supabase_user_id || session.client_reference_id;
  const tier = session.metadata?.subscription_tier;
  const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  if (!userId || !tier || !subId || !customerId) return;

  const sub = await stripe.subscriptions.retrieve(subId);
  const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from('profiles')
    .select('subscription_purchased_at')
    .eq('id', userId)
    .maybeSingle();

  const purchasedAt =
    (existing as { subscription_purchased_at?: string | null } | null)?.subscription_purchased_at || now;

  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subId,
      stripe_subscription_status: sub.status,
      membership_type: 'PREMIUM',
      subscription_tier: tier,
      auto_renew_membership: sub.cancel_at_period_end !== true,
      subscription_period_end: periodEnd,
      subscription_purchased_at: purchasedAt,
      last_payment_failure_at: null,
      updated_at: now,
    })
    .eq('id', userId);

  if (error) console.error('[stripe webhook] checkout.session.completed profile update', error);
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const sub = invoice.subscription;
  if (typeof sub === 'string') return sub;
  if (sub && typeof sub === 'object' && 'id' in sub) return (sub as { id: string }).id;
  return null;
}

function customerIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const c = invoice.customer;
  if (typeof c === 'string') return c;
  if (c && typeof c === 'object' && 'id' in c) return (c as { id: string }).id;
  return null;
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const invId = invoice.id;
  if (!invId) return;
  const subId = subscriptionIdFromInvoice(invoice);
  if (!subId) return;

  const amountUsd = (invoice.amount_paid ?? 0) / 100;
  const reason = invoice.billing_reason;
  const kind = reason === 'subscription_cycle' ? 'renewal' : 'initial';

  const line = invoice.lines?.data?.[0];
  const periodEndSec = line?.period?.end;
  const billingPeriodEnd = periodEndSec ? new Date(periodEndSec * 1000).toISOString() : null;

  const supabase = getServiceSupabase();
  await supabase
    .from('profiles')
    .update({
      last_payment_failure_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subId);

  const { data: prof, error: profErr } = await supabase
    .from('profiles')
    .select('id,email,subscription_tier,stripe_customer_id')
    .eq('stripe_subscription_id', subId)
    .maybeSingle();

  if (profErr) {
    console.error('[stripe webhook] invoice.paid profile lookup', profErr);
    return;
  }
  const row = prof as { id: string; email?: string | null; subscription_tier?: string | null; stripe_customer_id?: string | null } | null;
  if (!row?.id) return;

  const custId = customerIdFromInvoice(invoice) || row.stripe_customer_id || null;

  const { error } = await supabase.from('membership_payments').insert({
    user_id: row.id,
    user_email: row.email ?? invoice.customer_email ?? null,
    stripe_invoice_id: invId,
    stripe_subscription_id: subId,
    stripe_customer_id: custId,
    subscription_tier: row.subscription_tier ?? null,
    amount_usd: amountUsd,
    currency: invoice.currency || 'usd',
    kind,
    billing_period_end: billingPeriodEnd,
  });

  if (error) {
    if ((error as { code?: string }).code === '23505') return;
    console.error('[stripe webhook] invoice.paid insert', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subId = subscriptionIdFromInvoice(invoice);
  if (!subId) return;
  const invId = invoice.id;
  if (!invId) return;

  const amountDueUsd = (invoice.amount_due ?? 0) / 100;
  const now = new Date().toISOString();
  const supabase = getServiceSupabase();

  const { data: prof, error: profErr } = await supabase
    .from('profiles')
    .select('id,email,subscription_tier')
    .eq('stripe_subscription_id', subId)
    .maybeSingle();

  if (profErr) {
    console.error('[stripe webhook] invoice.payment_failed profile lookup', profErr);
    return;
  }
  const row = prof as { id: string; email?: string | null; subscription_tier?: string | null } | null;
  if (!row?.id) return;

  const { error: upErr } = await supabase
    .from('profiles')
    .update({
      last_payment_failure_at: now,
      updated_at: now,
    })
    .eq('id', row.id);

  if (upErr) console.error('[stripe webhook] invoice.payment_failed profile update', upErr);

  const { error: insErr } = await supabase.from('membership_payment_failures').insert({
    user_id: row.id,
    user_email: row.email ?? invoice.customer_email ?? null,
    stripe_invoice_id: invId,
    stripe_subscription_id: subId,
    amount_usd: amountDueUsd,
    currency: invoice.currency || 'usd',
  });

  if (insErr) console.error('[stripe webhook] invoice.payment_failed insert', insErr);
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription): Promise<void> {
  const supabase = getServiceSupabase();
  const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_subscription_status: sub.status,
      auto_renew_membership: sub.cancel_at_period_end !== true,
      subscription_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', sub.id);

  if (error) console.error('[stripe webhook] subscription.updated', error);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_subscription_id: null,
      stripe_subscription_status: null,
      last_payment_failure_at: null,
      membership_type: 'STANDARD',
      subscription_tier: null,
      auto_renew_membership: false,
      subscription_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', sub.id);

  if (error) console.error('[stripe webhook] subscription.deleted', error);
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    return new Response('Webhook not configured', { status: 500 });
  }

  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return new Response('Missing stripe-signature', { status: 400 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return new Response('Invalid body', { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'invalid signature';
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, stripe);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (e) {
    console.error('[stripe webhook] handler error', e);
    return new Response('Handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
