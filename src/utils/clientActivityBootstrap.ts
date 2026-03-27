/**
 * Global hooks for client activity (admin Activity tab): SPA view_page + debounced cart/wishlist snapshots,
 * and optional CustomEvent bridge for scattered UI.
 */
import { isSignedIn } from './adminAuth';
import { trackActivity } from './activity';

let listenersRegistered = false;
let lastViewKey = '';
let lastViewAt = 0;
let cartDebounce: ReturnType<typeof setTimeout> | null = null;
let wishDebounce: ReturnType<typeof setTimeout> | null = null;

function summarizeCart(): { itemCount: number; products: string[] } {
  try {
    const raw = localStorage.getItem('cartItems');
    const items = raw ? (JSON.parse(raw) as unknown[]) : [];
    if (!Array.isArray(items)) return { itemCount: 0, products: [] };
    const names = items
      .map((i: unknown) => {
        const o = i as { name?: string; productName?: string };
        return (o?.name || o?.productName || '').toString().trim();
      })
      .filter(Boolean);
    const itemCount = items.reduce((s, i: unknown) => {
      const q = (i as { quantity?: number })?.quantity;
      return s + (typeof q === 'number' && q > 0 ? q : 1);
    }, 0);
    return { itemCount, products: [...new Set(names)].slice(0, 16) };
  } catch {
    return { itemCount: 0, products: [] };
  }
}

function summarizeWishlist(): { itemCount: number; products: string[] } {
  try {
    const raw = localStorage.getItem('wishlistItems');
    const items = raw ? (JSON.parse(raw) as unknown[]) : [];
    if (!Array.isArray(items)) return { itemCount: 0, products: [] };
    const names = items
      .map((i: unknown) => {
        const o = i as { name?: string; productName?: string };
        return (o?.name || o?.productName || '').toString().trim();
      })
      .filter(Boolean);
    const itemCount = items.reduce((s, i: unknown) => {
      const q = (i as { quantity?: number })?.quantity;
      return s + (typeof q === 'number' && q > 0 ? q : 1);
    }, 0);
    return { itemCount, products: [...new Set(names)].slice(0, 16) };
  } catch {
    return { itemCount: 0, products: [] };
  }
}

function scheduleCartSnapshot(): void {
  if (!isSignedIn()) return;
  if (cartDebounce) clearTimeout(cartDebounce);
  cartDebounce = setTimeout(() => {
    cartDebounce = null;
    const { itemCount, products } = summarizeCart();
    trackActivity('cart_snapshot', { itemCount, products });
  }, 2200);
}

function scheduleWishlistSnapshot(): void {
  if (!isSignedIn()) return;
  if (wishDebounce) clearTimeout(wishDebounce);
  wishDebounce = setTimeout(() => {
    wishDebounce = null;
    const { itemCount, products } = summarizeWishlist();
    trackActivity('wishlist_snapshot', { itemCount, products });
  }, 2200);
}

/** Record SPA navigation for signed-in clients (skips /admin). Dedupes rapid repeats. */
export function trackClientViewPage(pathname: string, search: string): void {
  if (typeof window === 'undefined') return;
  if (!isSignedIn()) return;
  const path = pathname || '/';
  if (path.startsWith('/admin')) return;
  const full = path + (search || '');
  const now = Date.now();
  if (full === lastViewKey && now - lastViewAt < 1200) return;
  lastViewKey = full;
  lastViewAt = now;
  trackActivity('view_page', { path, search: search || '', fullPath: full });
}

/** Call once from App mount. */
export function registerGlobalClientActivityListeners(): void {
  if (typeof window === 'undefined' || listenersRegistered) return;
  listenersRegistered = true;

  const onCart = () => scheduleCartSnapshot();
  const onWish = () => scheduleWishlistSnapshot();
  window.addEventListener('cartUpdated', onCart);
  window.addEventListener('wishlistUpdated', onWish);

  window.addEventListener(
    'bawTrackActivity',
    ((e: Event) => {
      const ce = e as CustomEvent<{ eventType?: string; payload?: Record<string, unknown> }>;
      const t = ce.detail?.eventType?.toString().trim();
      if (!t) return;
      trackActivity(t, ce.detail?.payload);
    }) as EventListener
  );
}
