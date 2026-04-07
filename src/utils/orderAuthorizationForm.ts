/**
 * Order authorization form: only **custom units** (cap-size lines), **BCF bundles / closures / frontals**,
 * not bookings, gift cards, membership, or other digital-only lines.
 */

import { orderUsesDigitalFulfillmentTimeline } from './digitalOrderFulfillment';

const BCF_AUTH_CATEGORIES = new Set(['bundles', 'closures', 'frontals']);

export function cartLineRequiresOrderAuthorizationForm(item: Record<string, unknown> | null | undefined): boolean {
  if (!item || typeof item !== 'object') return false;
  const type = String(item.type ?? '').trim();
  const name = String(item.name ?? '').trim().toUpperCase();
  if (name === 'GIFT CARD' || type === 'gift-card' || type === 'digital') return false;
  if (type === 'booking-appointment' || type === 'booking-consult') return false;
  if (type === 'shop-texture-category') {
    const cat = String((item as { category?: string }).category ?? '').toLowerCase();
    return BCF_AUTH_CATEGORIES.has(cat);
  }
  const cap = item.capSize;
  if (cap != null && String(cap).trim() !== '') return true;
  return false;
}

export function cartRequiresOrderAuthorizationForm(items: unknown[] | null | undefined): boolean {
  if (!Array.isArray(items)) return false;
  return items.some((row) => cartLineRequiresOrderAuthorizationForm(row as Record<string, unknown>));
}

/** Persisted on each order row; legacy rows without the flag keep old behavior (non-digital ⇒ form). */
export function orderRequiresOrderAuthorizationForm(order: Record<string, unknown> | null | undefined): boolean {
  if (!order) return false;
  const v = order.requiresOrderAuthorizationForm;
  if (v === false) return false;
  if (v === true) return true;
  return !orderUsesDigitalFulfillmentTimeline(order);
}
