import { loadStripe, type Stripe, type StripeCardElement } from '@stripe/stripe-js';
import { createProductPaymentIntent } from './api';
import type { CheckoutQuoteLinePayload } from './checkoutQuote';

let stripePromise: Promise<Stripe | null> | null = null;

function publishableKey(): string {
  return (
    (import.meta as unknown as { env?: { VITE_STRIPE_PUBLISHABLE_KEY?: string } }).env
      ?.VITE_STRIPE_PUBLISHABLE_KEY || ''
  ).trim();
}

export function isStripePublishableConfigured(): boolean {
  return publishableKey().length > 0;
}

export function getStripeJs(): Promise<Stripe | null> {
  const key = publishableKey();
  if (!key) return Promise.resolve(null);
  if (!stripePromise) stripePromise = loadStripe(key);
  return stripePromise;
}

export async function confirmProductCheckoutPayment(args: {
  lines: CheckoutQuoteLinePayload[];
  card: StripeCardElement;
  billingName: string;
  billingEmail: string;
}): Promise<{ ok: true; paymentIntentId: string } | { ok: false; error: string }> {
  const stripe = await getStripeJs();
  if (!stripe) {
    return { ok: false, error: 'Stripe is not configured on this site (missing publishable key).' };
  }

  let clientSecret: string | null;
  let paymentIntentId: string;
  try {
    const pi = await createProductPaymentIntent(args.lines);
    clientSecret = pi.clientSecret;
    paymentIntentId = pi.paymentIntentId;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not start payment' };
  }

  if (!clientSecret) {
    return { ok: false, error: 'Missing payment client secret from server.' };
  }

  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: args.card,
      billing_details: {
        name: args.billingName,
        email: args.billingEmail,
      },
    },
  });

  if (result.error) {
    return { ok: false, error: result.error.message || 'Payment failed' };
  }

  const status = result.paymentIntent?.status;
  if (status !== 'succeeded' && status !== 'processing') {
    return { ok: false, error: `Payment status: ${status || 'unknown'}` };
  }

  return { ok: true, paymentIntentId: result.paymentIntent?.id || paymentIntentId };
}
