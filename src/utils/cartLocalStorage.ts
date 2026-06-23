import { sortCartPremiumBookingFirst } from './bookingCart';
import { migrateGiftCardCartLinesForStorage } from './giftCardCheckout';
import { attachStockStatusToLineItem } from './productInventoryAvailability';
import { stripIneligibleBcfBundleDealLines } from './premiumMemberAccess';
import { saveCartAndWishlistToUserKeys, hydrateGlobalCartFromUserKeyIfEmpty } from './cartWishlistStorage';
import { cartTotalQuantityUnits } from './cartTotalQuantityUnits';
import { getCurrentUserEmailFromStorage } from './perUserStorage';
import { schedulePushCartWishlistToCloud } from './pushCartWishlistToCloud';
import { seedShoppingBagMockCartIfEmpty } from './shoppingBagMockCart';

export const ACCOUNT_COMMERCE_SYNC_EVENT = 'accountCommerceSyncComplete';

function clampCartRows(items: any[]): any[] {
  return items.map((i: any) => {
    let row = i;
    if (i.consultOfferQtyLocked === true) row = { ...row, quantity: 1 };
    if (i.isSpecialOffer && (i.quantity ?? 1) > 2) row = { ...row, quantity: 2 };
    if (i.bcfBundleDeal) row = { ...row, quantity: 3 };
    return row;
  });
}

/** Write cart lines to global storage, mirror to per-user keys, and notify listeners. */
export function persistCartItemsToLocalStorage(items: unknown[]): number {
  const rows = Array.isArray(items) ? items : [];
  localStorage.setItem('cartItems', JSON.stringify(rows));
  const count = cartTotalQuantityUnits(rows as { quantity?: number }[]);
  localStorage.setItem('cartCount', String(count));

  const email = getCurrentUserEmailFromStorage();
  if (email) saveCartAndWishlistToUserKeys(email);

  window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: count }));
  window.dispatchEvent(new CustomEvent('cartItemsChanged'));
  window.dispatchEvent(new Event('cartUpdated'));
  schedulePushCartWishlistToCloud();
  return count;
}

/** Shared cart read path for `/bag`, `/desktop/shopping-bag`, and dropdown. */
export function loadCommerceCartFromStorage(): any[] {
  hydrateGlobalCartFromUserKeyIfEmpty();
  seedShoppingBagMockCartIfEmpty();

  try {
    const stored = localStorage.getItem('cartItems');
    if (!stored) return [];
    const items = JSON.parse(stored);
    if (!Array.isArray(items)) return [];

    const clamped = clampCartRows(items);
    const cartChanged = items.some(
      (i: any, idx: number) => (i.quantity ?? 1) !== (clamped[idx].quantity ?? 1),
    );
    if (cartChanged) {
      persistCartItemsToLocalStorage(clamped);
    }

    const giftMigrated = migrateGiftCardCartLinesForStorage(clamped);
    let afterGift = giftMigrated.next;
    if (giftMigrated.changed) {
      persistCartItemsToLocalStorage(afterGift);
    }

    const strip = stripIneligibleBcfBundleDealLines(afterGift);
    if (strip.removedUnitCount > 0) {
      persistCartItemsToLocalStorage(strip.next);
      return sortCartPremiumBookingFirst(
        strip.next.map((row: any) => attachStockStatusToLineItem(row)),
      );
    }

    return sortCartPremiumBookingFirst(
      afterGift.map((row: any) => attachStockStatusToLineItem(row)),
    );
  } catch {
    return [];
  }
}

export function readCartCountFromStorage(): number {
  try {
    const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
    if (Array.isArray(items)) {
      const fromItems = cartTotalQuantityUnits(items as { quantity?: number }[]);
      const raw = localStorage.getItem('cartCount');
      if (raw != null && raw !== '' && raw !== String(fromItems)) {
        localStorage.setItem('cartCount', String(fromItems));
      }
      return fromItems;
    }
    const raw = localStorage.getItem('cartCount');
    if (raw != null && raw !== '') {
      const n = parseInt(raw, 10);
      if (Number.isFinite(n) && n >= 0) return n;
    }
  } catch {
    /* ignore */
  }
  return 0;
}

export function dispatchAccountCommerceSyncComplete(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(ACCOUNT_COMMERCE_SYNC_EVENT));
}
