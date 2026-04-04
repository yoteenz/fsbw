import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getAuthUser } from '../_lib/auth';
import { getSupabaseAdmin } from '../_lib/supabase';
import {
  compareMembershipTierCost,
  isMembershipTierParam,
  membershipTierForStripePriceId,
  membershipTierPriceUsd,
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

function priceIdFromSubscriptionItem(item: Stripe.SubscriptionItem): string | null {
  const priceObj = item.price as Stripe.Price | null | undefined;
  return (priceObj?.id || '').trim() || null;
}

function membershipItemFromSubscription(sub: Stripe.Subscription): Stripe.SubscriptionItem | null {
  const items = sub.items?.data || [];
  for (const item of items) {
    const priceId = priceIdFromSubscriptionItem(item);
    if (!priceId) continue;
    if (membershipTierForStripePriceId(priceId)) return item;
  }
  return null;
}

function chargeIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const c = invoice.charge;
  if (typeof c === 'string') return c;
  if (c && typeof c === 'object' && 'id' in c) return String(c.id);
  return null;
}

function paymentIntentIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const pi = invoice.payment_intent;
  if (typeof pi === 'string') return pi;
  if (pi && typeof pi === 'object' && 'id' in pi) return String(pi.id);
  return null;
}

async function latestPaidChargeIdForSubscription(
  stripe: Stripe,
  subscriptionId: string
): Promise<string | null> {
  const invoices = await stripe.invoices.list({ subscription: subscriptionId, limit: 20 });
  for (const inv of invoices.data) {
    if (inv.paid !== true) continue;
    const chargeId = chargeIdFromInvoice(inv);
    if (chargeId) return chargeId;
    const paymentIntentId = paymentIntentIdFromInvoice(inv);
    if (!paymentIntentId) continue;
    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      const latestCharge = pi.latest_charge;
      if (typeof latestCharge === 'string' && latestCharge) return latestCharge;
      if (latestCharge && typeof latestCharge === 'object' && 'id' in latestCharge) {
        return String(latestCharge.id);
      }
    } catch {
      /* ignore invoice without retrievable PI */
    }
  }
  return null;
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

  let returnPath = typeof body.returnPath === 'string' ? body.returnPath.trim() : '/checkout/upgrade';
  if (!returnPath.startsWith('/') || returnPath.startsWith('//')) {
    returnPath = '/checkout/upgrade';
  }
  const sep = returnPath.includes('?') ? '&' : '?';
  const successUrl = `${site}${returnPath}${sep}stripe=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${site}${returnPath}${sep}stripe=cancel`;

  const stripe = new Stripe(secret);

  try {
    const supabase = getSupabaseAdmin();
    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('stripe_customer_id,stripe_subscription_id,subscription_tier,subscription_purchased_at,email')
      .eq('id', user.id)
      .maybeSingle();

    if (profErr) {
      console.error('[create-checkout-session] profile select', profErr);
      sendJson(res, 500, { error: profErr.message });
      return;
    }

    const profileRow = prof as {
      stripe_customer_id?: string | null;
      stripe_subscription_id?: string | null;
      subscription_tier?: string | null;
      subscription_purchased_at?: string | null;
      email?: string | null;
    } | null;
    let customerId = profileRow?.stripe_customer_id?.trim() || null;
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

    // Existing Stripe subscription on this profile:
    // - Upgrade (higher price): charge full new cycle now, then refund unused old-cycle value.
    // - Downgrade (lower price): keep current tier through period end, charge lower tier on renewal.
    const existingSubId = profileRow?.stripe_subscription_id?.trim() || null;
    if (existingSubId) {
      const existingSub = await stripe.subscriptions.retrieve(existingSubId, { expand: ['items.data.price'] });
      const membershipItem = membershipItemFromSubscription(existingSub);
      const existingStatus = (existingSub.status || '').toLowerCase();
      const canMutateExisting =
        existingStatus === 'active' ||
        existingStatus === 'trialing' ||
        existingStatus === 'past_due' ||
        existingStatus === 'unpaid';

      if (canMutateExisting && membershipItem) {
        const currentPriceId = priceIdFromSubscriptionItem(membershipItem);
        const currentTier = membershipTierForStripePriceId(currentPriceId);
        if (!currentTier) {
          sendJson(res, 409, {
            error:
              'Current subscription is on an unknown tier price. Please contact support to change membership tier.',
          });
          return;
        }

        const tierDelta = compareMembershipTierCost(tierRaw, currentTier);
        const currentPeriodEndIso = new Date(existingSub.current_period_end * 1000).toISOString();
        const nowIso = new Date().toISOString();

        if (tierDelta === 0) {
          sendJson(res, 200, {
            mode: 'subscription_updated',
            changeType: 'none',
            message: 'You are already on this membership tier.',
            nextBillingAt: currentPeriodEndIso,
          });
          return;
        }

        // Downgrade: keep current entitlement through period end, then start lower tier on renewal.
        // We use a subscription schedule so interval changes (e.g. 12 -> 3 months) never rebill immediately.
        if (tierDelta < 0) {
          const currentPriceId = priceIdFromSubscriptionItem(membershipItem);
          if (!currentPriceId) {
            sendJson(res, 409, { error: 'Current subscription price is missing. Cannot schedule downgrade.' });
            return;
          }

          const scheduleId = (() => {
            const s = existingSub.schedule;
            if (typeof s === 'string') return s;
            if (s && typeof s === 'object' && 'id' in s) return String(s.id);
            return null;
          })();

          const schedule = scheduleId
            ? await stripe.subscriptionSchedules.retrieve(scheduleId)
            : await stripe.subscriptionSchedules.create({ from_subscription: existingSub.id });

          await stripe.subscriptionSchedules.update(schedule.id, {
            end_behavior: 'release',
            phases: [
              {
                start_date: existingSub.current_period_start,
                end_date: existingSub.current_period_end,
                items: [{ price: currentPriceId, quantity: membershipItem.quantity || 1 }],
              },
              {
                start_date: existingSub.current_period_end,
                items: [{ price: priceId, quantity: membershipItem.quantity || 1 }],
              },
            ],
            metadata: {
              ...(existingSub.metadata || {}),
              pending_tier_change_to: tierRaw,
              pending_tier_change_effective_at: String(existingSub.current_period_end),
            },
          });

          const { error: upErr } = await supabase
            .from('profiles')
            .update({
              stripe_subscription_status: existingSub.status,
              auto_renew_membership: existingSub.cancel_at_period_end !== true,
              subscription_period_end: new Date(existingSub.current_period_end * 1000).toISOString(),
              membership_type: 'PREMIUM',
              updated_at: nowIso,
            })
            .eq('id', user.id);
          if (upErr) {
            console.error('[create-checkout-session] downgrade profile update', upErr);
          }

          sendJson(res, 200, {
            mode: 'subscription_updated',
            changeType: 'downgrade',
            message: `Downgrade scheduled. Your ${currentTier} plan stays active until renewal, then ${tierRaw} pricing starts.`,
            nextBillingAt: new Date(existingSub.current_period_end * 1000).toISOString(),
          });
          return;
        }

        // Upgrade: reset billing cycle anchor now, bill full new tier now, refund unused old-tier time.
        const preUpgradeChargeId = await latestPaidChargeIdForSubscription(stripe, existingSub.id);
        const oldTierPriceCents = (() => {
          const unitAmount = membershipItem.price?.unit_amount;
          if (typeof unitAmount === 'number' && Number.isFinite(unitAmount) && unitAmount > 0) return unitAmount;
          return Math.round(membershipTierPriceUsd(currentTier) * 100);
        })();
        const nowSeconds = Math.floor(Date.now() / 1000);
        const periodSeconds = Math.max(1, existingSub.current_period_end - existingSub.current_period_start);
        const remainingSeconds = Math.max(0, existingSub.current_period_end - nowSeconds);
        const remainingRatio = Math.min(1, remainingSeconds / periodSeconds);
        const requestedProratedRefundCents = Math.max(0, Math.round(oldTierPriceCents * remainingRatio));

        const upgradedSub = await stripe.subscriptions.update(existingSub.id, {
          cancel_at_period_end: false,
          proration_behavior: 'none',
          billing_cycle_anchor: 'now',
          items: [{ id: membershipItem.id, price: priceId }],
          metadata: {
            ...(existingSub.metadata || {}),
            pending_tier_change_to: '',
            pending_tier_change_effective_at: '',
          },
        });

        let refundedCents = 0;
        if (preUpgradeChargeId && requestedProratedRefundCents > 0) {
          try {
            const charge = await stripe.charges.retrieve(preUpgradeChargeId);
            const refundable = Math.max(0, (charge.amount || 0) - (charge.amount_refunded || 0));
            const refundAmount = Math.min(refundable, requestedProratedRefundCents);
            if (refundAmount > 0) {
              const refund = await stripe.refunds.create({
                charge: preUpgradeChargeId,
                amount: refundAmount,
                metadata: {
                  supabase_user_id: user.id,
                  refund_type: 'membership_upgrade_proration',
                  from_tier: currentTier,
                  to_tier: tierRaw,
                },
              });
              refundedCents = typeof refund.amount === 'number' ? refund.amount : refundAmount;
            }
          } catch (refundErr) {
            console.error('[create-checkout-session] upgrade proration refund', refundErr);
          }
        }

        const purchasedAt = profileRow?.subscription_purchased_at || nowIso;
        const { error: upErr } = await supabase
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: upgradedSub.id,
            stripe_subscription_status: upgradedSub.status,
            membership_type: 'PREMIUM',
            subscription_tier: tierRaw,
            auto_renew_membership: upgradedSub.cancel_at_period_end !== true,
            subscription_period_end: new Date(upgradedSub.current_period_end * 1000).toISOString(),
            subscription_purchased_at: purchasedAt,
            last_payment_failure_at: null,
            updated_at: nowIso,
          })
          .eq('id', user.id);
        if (upErr) {
          console.error('[create-checkout-session] upgrade profile update', upErr);
        }

        sendJson(res, 200, {
          mode: 'subscription_updated',
          changeType: 'upgrade',
          message:
            'Upgrade complete. Charged full new tier for a new cycle and refunded unused time from your current subscription.',
          nextBillingAt: new Date(upgradedSub.current_period_end * 1000).toISOString(),
          refundAmountUsd: Number((refundedCents / 100).toFixed(2)),
        });
        return;
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

    sendJson(res, 200, { mode: 'checkout', url: session.url, sessionId: session.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Stripe error';
    console.error('[create-checkout-session]', e);
    sendJson(res, 500, { error: msg });
  }
}
