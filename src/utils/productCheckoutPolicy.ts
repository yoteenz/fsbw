/**
 * When product checkout must use Stripe PaymentIntent vs legacy founder/test flow.
 */
import { getAccessToken } from './api';

let cachedPolicy: {
  at: number;
  available: boolean;
  legacyCheckoutAllowed: boolean;
  requiresStripeWhenAvailable: boolean;
} | null = null;

const CACHE_MS = 60_000;

export type ProductCheckoutPolicy = {
  stripeProductCheckoutAvailable: boolean;
  legacyCheckoutAllowed: boolean;
  /** Block CONFIRM ORDER unless Stripe PI succeeds (or founder dummy when legacy allowed). */
  requireStripePayment: boolean;
  blockLegacyConfirm: boolean;
};

export async function fetchProductCheckoutPolicy(): Promise<ProductCheckoutPolicy> {
  const now = Date.now();
  if (cachedPolicy && now - cachedPolicy.at < CACHE_MS) {
    return {
      stripeProductCheckoutAvailable: cachedPolicy.available,
      legacyCheckoutAllowed: cachedPolicy.legacyCheckoutAllowed,
      requireStripePayment: cachedPolicy.requiresStripeWhenAvailable && cachedPolicy.available,
      blockLegacyConfirm: cachedPolicy.requiresStripeWhenAvailable && cachedPolicy.available,
    };
  }

  try {
    const env = (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env;
    const base = (env?.VITE_API_BASE || '').replace(/\/$/, '');
    const url = base ? `${base}/api/stripe/product-checkout-available` : '/api/stripe/product-checkout-available';
    const res = await fetch(url);
    const data = (await res.json()) as {
      available?: boolean;
      legacyCheckoutAllowed?: boolean;
      requiresStripeWhenAvailable?: boolean;
    };
    cachedPolicy = {
      at: now,
      available: data.available === true,
      legacyCheckoutAllowed: data.legacyCheckoutAllowed === true,
      requiresStripeWhenAvailable: data.requiresStripeWhenAvailable === true,
    };
  } catch {
    const legacy =
      (import.meta as unknown as { env?: { VITE_ALLOW_LEGACY_CHECKOUT?: string } }).env
        ?.VITE_ALLOW_LEGACY_CHECKOUT === '1';
    cachedPolicy = {
      at: now,
      available: false,
      legacyCheckoutAllowed: legacy,
      requiresStripeWhenAvailable: false,
    };
  }

  return {
    stripeProductCheckoutAvailable: cachedPolicy.available,
    legacyCheckoutAllowed: cachedPolicy.legacyCheckoutAllowed,
    requireStripePayment: cachedPolicy.requiresStripeWhenAvailable && cachedPolicy.available,
    blockLegacyConfirm: cachedPolicy.requiresStripeWhenAvailable && cachedPolicy.available,
  };
}

export async function shouldRunStripeProductPayment(args: {
  isSubscriptionUpgrade: boolean;
  isBookingsCheckoutRoute: boolean;
  isGiftCardCheckoutRoute: boolean;
  usedFounderDummyPan: boolean;
}): Promise<{ run: boolean; blockLegacy: boolean; reason?: string }> {
  if (args.isSubscriptionUpgrade || args.isBookingsCheckoutRoute || args.isGiftCardCheckoutRoute) {
    return { run: false, blockLegacy: false };
  }

  const policy = await fetchProductCheckoutPolicy();
  if (!policy.stripeProductCheckoutAvailable) {
    return { run: false, blockLegacy: false };
  }

  if (args.usedFounderDummyPan && policy.legacyCheckoutAllowed) {
    return { run: false, blockLegacy: false };
  }

  if (policy.requireStripePayment) {
    const token = await getAccessToken();
    if (!token) {
      return {
        run: false,
        blockLegacy: true,
        reason: 'SIGN IN WITH YOUR ACCOUNT TO COMPLETE CARD PAYMENT.',
      };
    }
    return { run: true, blockLegacy: true };
  }

  return { run: false, blockLegacy: false };
}
