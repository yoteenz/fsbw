import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPublicFxRatesPayload } from '../_lib/pricing/fxRates.js';

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

/**
 * GET /api/fx/rates
 * Public FX table used for display + Stripe charge conversion (USD base).
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

  sendJson(res, 200, { ok: true, ...getPublicFxRatesPayload() });
}
