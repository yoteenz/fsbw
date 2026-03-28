import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Keep logic aligned with `api/_lib/stripeMembership.ts` → `membershipStripeConfigured()`.
 * This file does NOT import `_lib` so Vercel bundling avoids resolution/runtime failures
 * (same pattern as `api/special-offer-config.ts` / `api/profile.ts` comments).
 */
function membershipStripeConfigured(): boolean {
  const sk = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!sk) return false;
  const p3 = (process.env.STRIPE_PRICE_ID_3MONTHS || '').trim();
  const p6 = (process.env.STRIPE_PRICE_ID_6MONTHS || '').trim();
  const p12 = (process.env.STRIPE_PRICE_ID_12MONTHS || '').trim();
  return Boolean(p3 && p6 && p12);
}

function sendJson(res: VercelResponse, status: number, body: Record<string, unknown>): void {
  try {
    const json = JSON.stringify(body);
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(json);
  } catch (e) {
    console.error('[membership-available] sendJson failed:', e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('JSON serialization failed');
  }
}

/** GET /api/stripe/membership-available — public; true when Stripe secret + three price ids are set. */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }
    sendJson(res, 200, { available: membershipStripeConfigured() });
  } catch (e) {
    console.error('[membership-available] Uncaught:', e);
    sendJson(res, 500, { error: 'Internal error', available: false });
  }
}
