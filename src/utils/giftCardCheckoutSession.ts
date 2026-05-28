import { isGiftCardCartLine } from './giftCardCheckout';

export type WriteGiftCardCheckoutOpts = {
  balanceUsd: number;
  /** Cart line image; tools hub and PDP use different assets */
  image?: string;
};

/** Prior non–gift-card bag saved when entering isolated `/checkout/gift-card`. */
export const GIFT_CARD_CHECKOUT_CART_BACKUP_KEY = 'giftCardCheckoutCartBackup';

function parseStoredCartItems(): { type?: string; name?: string; quantity?: number }[] {
  try {
    const stored = localStorage.getItem('cartItems');
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function nonGiftCartLines<T extends { type?: string; name?: string }>(items: T[]): T[] {
  return (items || []).filter((i) => !isGiftCardCartLine(i));
}

function persistCartItemsAndDispatch(items: { quantity?: number }[]): number {
  localStorage.setItem('cartItems', JSON.stringify(items));

  const newCartCount = items.reduce(
    (sum: number, row: { quantity?: number }) => sum + (row.quantity || 1),
    0
  );
  localStorage.setItem('cartCount', String(newCartCount));

  window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCartCount }));
  window.dispatchEvent(new CustomEvent('cartItemsChanged'));
  window.dispatchEvent(new Event('cartUpdated'));

  return newCartCount;
}

/** Save wig/BCF/booking lines before isolated gift-card checkout replaces `cartItems`. */
export function backupCartBeforeGiftCardCheckoutSession(): void {
  const existing = parseStoredCartItems();
  const toBackup = nonGiftCartLines(existing);
  if (toBackup.length === 0) return;
  // Keep the first backup when cart is already gift-only (e.g. changing denomination mid-flow).
  if (localStorage.getItem(GIFT_CARD_CHECKOUT_CART_BACKUP_KEY)) return;
  localStorage.setItem(GIFT_CARD_CHECKOUT_CART_BACKUP_KEY, JSON.stringify(toBackup));
}

export function clearGiftCardCheckoutCartBackup(): void {
  localStorage.removeItem(GIFT_CARD_CHECKOUT_CART_BACKUP_KEY);
}

export function hasGiftCardCheckoutCartBackup(): boolean {
  const raw = localStorage.getItem(GIFT_CARD_CHECKOUT_CART_BACKUP_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

/**
 * Restore the bag saved before isolated gift-card checkout.
 * Returns new cart count when restored, otherwise null.
 */
export function restoreGiftCardCheckoutCartFromBackup(): number | null {
  const raw = localStorage.getItem(GIFT_CARD_CHECKOUT_CART_BACKUP_KEY);
  if (!raw) return null;
  try {
    const backup = JSON.parse(raw);
    if (!Array.isArray(backup) || backup.length === 0) {
      clearGiftCardCheckoutCartBackup();
      return null;
    }
    const count = persistCartItemsAndDispatch(backup);
    clearGiftCardCheckoutCartBackup();
    return count;
  } catch {
    clearGiftCardCheckoutCartBackup();
    return null;
  }
}

/**
 * After abandoning gift-card checkout (empty cart or only gift-card lines left),
 * restore the prior bag when a backup exists.
 */
export function maybeRestoreGiftCardCheckoutCartAfterAbandon(
  remainingItems: { type?: string; name?: string }[]
): number | null {
  if (!hasGiftCardCheckoutCartBackup()) return null;
  if (remainingItems.some((i) => !isGiftCardCartLine(i))) return null;
  return restoreGiftCardCheckoutCartFromBackup();
}

/**
 * Isolated gift-card checkout: **replaces** the bag with exactly one gift-card line (same idea as
 * `/checkout/gift-card` filtering — no units, BCF, bookings, etc. left in storage).
 * Backs up any existing non–gift-card lines first so cancel/remove can restore the prior bag.
 * Updates cartCount, persists, and dispatches cart sync events. Caller navigates to `/checkout/gift-card`.
 */
export function writeGiftCardSelectionForCheckoutSession(opts: WriteGiftCardCheckoutOpts): number {
  backupCartBeforeGiftCardCheckoutSession();

  const balanceUsd = opts.balanceUsd;
  const image = opts.image ?? '/assets/giftcard-product.png';

  const newItem = {
    id: `gift-card-${balanceUsd}-${Date.now()}`,
    name: 'GIFT CARD',
    price: balanceUsd,
    quantity: 1,
    balance: balanceUsd,
    giftCardUnitUsd: balanceUsd,
    image,
    type: 'gift-card',
  };
  return persistCartItemsAndDispatch([newItem]);
}
