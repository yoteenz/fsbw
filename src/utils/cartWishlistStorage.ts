import { writeStoredCartVersion } from './cartServerSync';
import { cartTotalQuantityUnits } from './cartTotalQuantityUnits';

/**
 * Per-user cart, wishlist, and saved lists storage.
 * When the signed-in user changes, we swap global localStorage so the active user's data is shown.
 * New accounts get empty cart/wishlist/lists; no admin or previous user data is shown.
 */

function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

function cartKey(email: string | null): string {
  return email ? `cartItems_${normalizeEmail(email)}` : 'cartItems';
}

function wishlistKey(email: string | null): string {
  return email ? `wishlistItems_${normalizeEmail(email)}` : 'wishlistItems';
}

function userListsKey(email: string | null): string {
  return email ? `userLists_${normalizeEmail(email)}` : 'userLists';
}

/**
 * Save current global cart, wishlist, and userLists to the given user's per-user keys.
 * Call with previous user's email before switching (e.g. before Supabase sync) so their data is preserved.
 */
export function saveCartAndWishlistToUserKeys(email: string): void {
  const e = normalizeEmail(email);
  if (!e) return;
  try {
    const cart = localStorage.getItem('cartItems');
    const wishlist = localStorage.getItem('wishlistItems');
    const lists = localStorage.getItem('userLists');
    if (cart !== null) localStorage.setItem(cartKey(e), cart);
    if (wishlist !== null) localStorage.setItem(wishlistKey(e), wishlist);
    if (lists !== null) localStorage.setItem(userListsKey(e), lists);
  } catch (_) {
    // ignore
  }
}

/** Cart UI keys that are global; clear on user switch so the next user doesn't see previous user's state. */
const CART_UI_KEYS = ['addToBagButtonState', 'lastAddedItemId', 'editingCartItem', 'editingCartItemId'] as const;

/**
 * Load the given user's cart, wishlist, and userLists into global keys.
 * Use null to clear globals (e.g. on sign-out).
 * Clears cart UI state (editingCartItem, addToBagButtonState, etc.) so it doesn't bleed between users.
 */
function loadFromUserKeys(email: string | null): void {
  try {
    // Clear cart UI state when switching user so the new user doesn't see previous user's add-to-bag/edit state
    CART_UI_KEYS.forEach((k) => localStorage.removeItem(k));
    if (email) {
      writeStoredCartVersion(null);
      const e = normalizeEmail(email);
      const cart = localStorage.getItem(cartKey(e));
      const wishlist = localStorage.getItem(wishlistKey(e));
      const lists = localStorage.getItem(userListsKey(e));
      localStorage.setItem('cartItems', cart || '[]');
      const parsed = cart ? (JSON.parse(cart) as { quantity?: number }[]) : [];
      localStorage.setItem('cartCount', cart ? String(cartTotalQuantityUnits(parsed)) : '0');
      localStorage.setItem('wishlistItems', wishlist || '[]');
      if (lists !== null) localStorage.setItem('userLists', lists);
      else localStorage.removeItem('userLists');
    } else {
      writeStoredCartVersion(null);
      localStorage.setItem('cartItems', '[]');
      localStorage.setItem('cartCount', '0');
      localStorage.setItem('wishlistItems', '[]');
      localStorage.removeItem('userLists');
    }
    window.dispatchEvent(
      new CustomEvent('cartCountUpdated', {
        detail: email ? cartTotalQuantityUnits(JSON.parse(localStorage.getItem('cartItems') || '[]') as { quantity?: number }[]) : 0,
      })
    );
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    window.dispatchEvent(new CustomEvent('userListsUpdated'));
  } catch (_) {
    // ignore
  }
}

/**
 * Call when the signed-in user changes (sign-in, sign-up, or sign-out).
 * Saves the previous user's global cart/wishlist/lists to their per-user keys,
 * then loads the new user's data (or empty) into global keys.
 * @param previousEmail - Email of the user who was signed in (null if none).
 * @param newEmail - Email of the user now signed in (null on sign-out).
 */
export function swapCartAndWishlistToUser(previousEmail: string | null, newEmail: string | null): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (previousEmail && normalizeEmail(previousEmail)) {
    saveCartAndWishlistToUserKeys(previousEmail);
  }
  loadFromUserKeys(newEmail);
}
