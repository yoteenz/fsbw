import type { VercelRequest, VercelResponse } from '@vercel/node';

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

/**
 * GET /api/stripe/product-checkout-available
 * True when server + client Stripe keys exist and product PaymentIntents can run.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const secret = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const publishable =
    (process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
  const legacyAllowed = process.env.ALLOW_LEGACY_CHECKOUT === '1' || process.env.ALLOW_LEGACY_CHECKOUT === 'true';

  sendJson(res, 200, {
    available: secret && publishable.length > 0,
    legacyCheckoutAllowed: legacyAllowed,
    requiresStripeWhenAvailable: secret && !legacyAllowed,
  });
}
