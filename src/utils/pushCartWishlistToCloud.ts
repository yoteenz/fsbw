/**
 * Debounced push of local cart, wishlist, and orders to Supabase (PUT /api/cart, /api/wishlist, /api/orders).
 * Call on navigation so signed-in users keep cloud state aligned without editing every page.
 */
import { getSupabase, isSupabaseConfigured } from './supabase';
import { isSignedIn } from './adminAuth';
import { putCart, putWishlist, putOrders } from './api';

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
      if (Array.isArray(cart)) await putCart(cart).catch(() => {});
      if (Array.isArray(wish)) await putWishlist(wish).catch(() => {});
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
