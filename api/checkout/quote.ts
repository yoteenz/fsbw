import type { VercelRequest, VercelResponse } from '@vercel/node';
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

/**
 * POST /api/checkout/quote
 * Body: { lines: QuoteLineInput[] } — do not send trusted totals; server recomputes USD.
 * Public (no auth) so the bag can show a server-verified subtotal for display.
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

  const body = parseBody(req);
  const raw = body.lines;
  if (!Array.isArray(raw)) {
    sendJson(res, 400, { error: 'Expected { lines: [...] }' });
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
      capSize: typeof o.capSize === 'string' ? o.capSize : undefined
    };
  });

  const quote = resolveCheckoutQuoteLines(lines);
  sendJson(res, 200, { ok: true, quote });
}
