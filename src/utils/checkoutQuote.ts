/**
 * Client → POST /api/checkout/quote — server recomputes USD from line identities (not client `price`).
 */
import type { CartItem } from '../types/cart';

export type CheckoutQuoteLinePayload = {
  id?: string;
  name: string;
  quantity: number;
  type?: string;
  bookingInstallKind?: string;
  bookingStyle?: string;
  bookingAddonIds?: string[];
  bcfBundleDeal?: boolean;
  bcfBundleDealListSubtotal?: number;
  capSize?: string;
  consultStyleAnalysisComparisonCount?: 1 | 3 | 6;
  hairstyleAnalysisComparisonCount?: 1 | 3 | 6;
};

export type ServerCheckoutQuote = {
  currency: 'usd';
  totalCents: number;
  lines: Array<{
    key: string;
    description: string;
    quantity: number;
    amountCents: number;
    resolved: boolean;
    note?: string;
  }>;
  fullyResolved: boolean;
  warnings: string[];
};

export function cartItemsToQuoteLines(items: CartItem[]): CheckoutQuoteLinePayload[] {
  return (items || []).map((item) => ({
    id: item.id,
    name: item.name || '',
    quantity: item.quantity ?? 1,
    type: item.type,
    bookingInstallKind: item.bookingInstallKind,
    bookingStyle: item.bookingStyle,
    bookingAddonIds: item.bookingAddonIds,
    bcfBundleDeal: item.bcfBundleDeal === true,
    bcfBundleDealListSubtotal: item.bcfBundleDealListSubtotal,
    capSize: item.capSize,
    consultStyleAnalysisComparisonCount: item.consultStyleAnalysisComparisonCount,
    hairstyleAnalysisComparisonCount: item.hairstyleAnalysisComparisonCount,
  }));
}

export async function fetchCheckoutQuote(
  lines: CheckoutQuoteLinePayload[]
): Promise<{ ok: true; quote: ServerCheckoutQuote } | { ok: false; error: string }> {
  const env = (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env;
  const base = (env?.VITE_API_BASE || '').replace(/\/$/, '');
  const url = base ? `${base}/api/checkout/quote` : '/api/checkout/quote';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines })
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, error: text || `HTTP ${res.status}` };
    }
    const data = JSON.parse(text) as { ok?: boolean; quote?: ServerCheckoutQuote };
    if (!data?.quote) return { ok: false, error: 'Invalid quote response' };
    return { ok: true, quote: data.quote };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}
