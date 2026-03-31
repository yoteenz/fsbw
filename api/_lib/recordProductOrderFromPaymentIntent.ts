import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * After Stripe `payment_intent.succeeded` for product checkout, append an order to the user's `orders` JSONB.
 * Idempotent on `stripe_payment_intent_id` stored on the order object.
 */
export async function appendOrderFromProductPaymentIntent(
  supabase: SupabaseClient,
  userId: string,
  params: {
    paymentIntentId: string;
    amountCents: number;
    currency: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const { paymentIntentId, amountCents, currency } = params;
  const totalUsd = amountCents / 100;

  const { data: existingRow, error: fetchErr } = await supabase
    .from('orders')
    .select('id, active_orders, past_orders')
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchErr) {
    return { ok: false, error: fetchErr.message };
  }

  const now = new Date().toISOString();
  const orderId = `order-pi-${paymentIntentId.slice(-12)}`;
  const newOrder = {
    id: orderId,
    orderNumber: `ORDER ${orderId.toUpperCase()}`,
    date: now,
    status: 'PAID',
    productName: 'STRIPE CHECKOUT',
    productImage: '/assets/natural front.png',
    total: totalUsd,
    subtotal: totalUsd,
    items: 1,
    placedAt: Date.now(),
    stripePaymentIntentId: paymentIntentId,
    stripeCurrency: currency,
    paymentProvider: 'stripe_payment_intent'
  };

  const checkDuplicate = (arr: unknown[]): boolean =>
    Array.isArray(arr) &&
    arr.some(
      (o) =>
        o &&
        typeof o === 'object' &&
        (o as { stripePaymentIntentId?: string }).stripePaymentIntentId === paymentIntentId
    );

  if (existingRow) {
    const row = existingRow as {
      id?: string;
      active_orders?: unknown[];
      past_orders?: unknown[];
    };
    const active = Array.isArray(row.active_orders) ? [...row.active_orders] : [];
    const past = Array.isArray(row.past_orders) ? [...row.past_orders] : [];
    if (checkDuplicate(active) || checkDuplicate(past)) {
      return { ok: true };
    }
    active.push(newOrder);
    const { error: upErr } = await supabase
      .from('orders')
      .update({
        active_orders: active,
        updated_at: now
      })
      .eq('user_id', userId);
    if (upErr) return { ok: false, error: upErr.message };
    return { ok: true };
  }

  const { error: insErr } = await supabase.from('orders').insert({
    user_id: userId,
    active_orders: [newOrder],
    past_orders: [],
    updated_at: now
  });
  if (insErr) return { ok: false, error: insErr.message };
  return { ok: true };
}
