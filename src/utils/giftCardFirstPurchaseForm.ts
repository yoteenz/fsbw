/**
 * First-time gift-card purchase: require one order authorization form per account (ID + signature)
 * to reduce fraud; subsequent gift-only checkouts skip this gate.
 */

import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from './perUserStorage';
import { isGiftCardCartLine } from './giftCardCheckout';
import { orderRequiresOrderAuthorizationForm } from './orderAuthorizationForm';

function normEmail(email: string | null | undefined): string {
  return (email || '').trim().toLowerCase();
}

export function cartHasGiftCardLine(items: unknown[] | null | undefined): boolean {
  if (!Array.isArray(items)) return false;
  return items.some((row) => isGiftCardCartLine(row as Record<string, unknown>));
}

/** Cart is only gift cards (no units, BCF, bookings, etc.). */
export function cartIsGiftCardOnlyPurchase(items: unknown[] | null | undefined): boolean {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.every((row) => {
    const i = row as Record<string, unknown>;
    return isGiftCardCartLine(i);
  });
}

export function isGiftCardPurchaserVerifiedForEmail(email: string | null | undefined): boolean {
  const key = getPerUserKey(PER_USER_KEYS.giftCardPurchaserIdentityVerified, email);
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

export function setGiftCardPurchaserVerifiedForEmail(email: string | null | undefined): void {
  const e = normEmail(email);
  if (!e) return;
  try {
    localStorage.setItem(getPerUserKey(PER_USER_KEYS.giftCardPurchaserIdentityVerified, e), 'true');
  } catch {
    /* ignore */
  }
}

/**
 * True when this checkout should require the standard order form before fulfillment (first gift-only purchase only).
 */
export function cartRequiresGiftCardIdentityForm(
  items: unknown[] | null | undefined,
  signedInEmail: string | null | undefined
): boolean {
  if (!cartIsGiftCardOnlyPurchase(items)) return false;
  const email = normEmail(signedInEmail) || normEmail(getCurrentUserEmailFromStorage());
  if (!email) return false;
  return !isGiftCardPurchaserVerifiedForEmail(email);
}

export function orderRequiresGiftCardIdentityForm(order: Record<string, unknown> | null | undefined): boolean {
  return order?.requiresGiftCardIdentityForm === true;
}

/** Physical unit/BCF auth form OR first-time gift-card ID verification (same `/tools/order-form` flow). */
export function orderNeedsClientAuthFormSignature(order: Record<string, unknown> | null | undefined): boolean {
  if (!order) return false;
  return orderRequiresOrderAuthorizationForm(order) || orderRequiresGiftCardIdentityForm(order);
}
