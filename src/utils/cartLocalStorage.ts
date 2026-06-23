import { saveCartAndWishlistToUserKeys } from './cartWishlistStorage';
import { cartTotalQuantityUnits } from './cartTotalQuantityUnits';
import { getCurrentUserEmailFromStorage } from './perUserStorage';
import { schedulePushCartWishlistToCloud } from './pushCartWishlistToCloud';

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
