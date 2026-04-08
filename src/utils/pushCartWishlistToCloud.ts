/**
 * Debounced push of local cart, wishlist, and orders to Supabase (PUT /api/cart, /api/wishlist, /api/orders).
 * Call on navigation so signed-in users keep cloud state aligned without editing every page.
 */
import { getSupabase, isSupabaseConfigured } from './supabase';
import { isSignedIn } from './adminAuth';
import { putCart, putWishlist, putOrders, getCart, CartVersionConflictError } from './api';
import { trackActivity } from './activity';
import { mergeCartItemsUnion, readStoredCartVersion, writeStoredCartVersion } from './cartServerSync';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function schedulePushCartWishlistToCloud(): void {
  if (typeof window === 'undefined' || !isSupabaseConfigured() || !isSignedIn()) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    debounceTimer = null;
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    try {
      const cartRaw = localStorage.getItem('cartItems');
      const wishRaw = localStorage.getItem('wishlistItems');
      const cart = cartRaw ? JSON.parse(cartRaw) : [];
      const wish = wishRaw ? JSON.parse(wishRaw) : [];
      let cartSynced = false;
      let wishSynced = false;
      if (Array.isArray(cart)) {
        try {
          const base = readStoredCartVersion();
          const res = await putCart(cart, base);
          if (res.version != null) writeStoredCartVersion(res.version);
          cartSynced = true;
        } catch (e) {
          if (e instanceof CartVersionConflictError) {
            try {
              const { items: serverItems, version: serverVersion } = await getCart();
              const merged = mergeCartItemsUnion(cart, Array.isArray(serverItems) ? serverItems : []);
              const put = await putCart(merged, serverVersion ?? null);
              localStorage.setItem('cartItems', JSON.stringify(merged));
              localStorage.setItem('cartCount', String(merged.length));
              if (put.version != null) writeStoredCartVersion(put.version);
              window.dispatchEvent(new CustomEvent('cartItemsChanged'));
              window.dispatchEvent(new Event('cartUpdated'));
              cartSynced = true;
            } catch {
              /* ignore */
            }
          }
        }
      }
      if (Array.isArray(wish)) {
        try {
          await putWishlist(wish);
          wishSynced = true;
        } catch {
          /* ignore */
        }
      }
      if (cartSynced || wishSynced) {
        trackActivity('cloud_sync', {
          cartCount: Array.isArray(cart) ? cart.length : 0,
          wishlistCount: Array.isArray(wish) ? wish.length : 0,
        });
      }
      let email = '';
      try {
        const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
        email = (u.email || '').trim();
      } catch {
        email = '';
      }
      if (email) {
        const ordersRaw = localStorage.getItem(`userOrders_${email}`);
        let activeOrders: unknown[] = [];
        let pastOrders: unknown[] = [];
        if (ordersRaw) {
          try {
            const parsed = JSON.parse(ordersRaw) as { activeOrders?: unknown; pastOrders?: unknown };
            activeOrders = Array.isArray(parsed.activeOrders) ? parsed.activeOrders : [];
            pastOrders = Array.isArray(parsed.pastOrders) ? parsed.pastOrders : [];
          } catch {
            /* ignore */
          }
        }
        await putOrders(activeOrders, pastOrders).catch(() => {});
      }
    } catch {
      // ignore
    }
  }, 2000);
}
