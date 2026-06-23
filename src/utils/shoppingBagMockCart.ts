import { isPreviewEnvironment, isSignedIn } from './adminAuth';
import { sortCartPremiumBookingFirst } from './bookingCart';
import { migrateGiftCardCartLinesForStorage } from './giftCardCheckout';
import { attachStockStatusToLineItem } from './productInventoryAvailability';
import { stripIneligibleBcfBundleDealLines } from './premiumMemberAccess';

/** Shared mock cart lines — written to `localStorage.cartItems` when the bag is empty. */
export const SHOPPING_BAG_MOCK_CART_ITEMS: Record<string, unknown>[] = [
  {
    id: 'mock-bag-noir',
    name: 'NOIR',
    price: 740,
    quantity: 1,
    image: '/assets/NOIR/noir-thumb.png',
    capSize: 'M',
    length: '24"',
    density: '200%',
    color: 'OFF BLACK',
    texture: 'SILKY',
    lace: '13X6',
    hairline: 'NATURAL',
    styling: 'NONE',
    addOns: [],
  },
  {
    id: 'mock-bag-blanco',
    name: 'BLANCO',
    price: 820,
    quantity: 2,
    image: '/assets/NOIR/blanco-thumb.png',
    capSize: 'S/M/L',
    capSizePrice: 40,
    length: '22"',
    density: '200%',
    color: 'PLATINUM',
    texture: 'SILKY',
    lace: '13X6',
    hairline: 'NATURAL',
    styling: 'NONE',
    addOns: [],
  },
  {
    id: 'mock-bag-closures',
    name: 'CLOSURES',
    type: 'shop-texture-category',
    category: 'closures',
    texture: 'wavy',
    hairOrigin: 'INDIAN',
    price: 285,
    quantity: 1,
    image: '/assets/closure-wavy.png',
    length: '18"',
    color: 'OFF BLACK',
    lace: '4X4',
  },
  {
    id: 'mock-bag-soft-wave',
    name: 'SOFT WAVE',
    price: 680,
    quantity: 1,
    image: '/assets/wavy-thumb.png',
    capSize: 'M',
    length: '24"',
    density: '180%',
    color: 'OFF BLACK',
    texture: 'WAVY',
    lace: '13X6',
    hairline: 'NATURAL',
    styling: 'NONE',
    addOns: [],
  },
  {
    id: 'mock-bag-ocean-curl',
    name: 'OCEAN CURL',
    price: 695,
    quantity: 1,
    image: '/assets/curly-thumb.png',
    capSize: 'M',
    length: '22"',
    density: '200%',
    color: 'OFF BLACK',
    texture: 'CURLY',
    lace: '13X6',
    hairline: 'NATURAL',
    styling: 'NONE',
    addOns: [],
  },
];

const MOCK_DISMISS_KEY = 'shoppingBagMockDismissed';

/**
 * Mock cart for UI QA when the real bag is empty.
 * - Local dev + Vercel preview hosts (`*.vercel.app`, localhost)
 * - Production override: `?shoppingBagMock=1`
 * - Opt out on preview/dev: `?shoppingBagMock=0` (persists for the tab session)
 */
export function isShoppingBagMockCartEnabled(): boolean {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('shoppingBagMock') === '0') {
        window.sessionStorage.setItem(MOCK_DISMISS_KEY, '1');
        return false;
      }
      if (params.get('shoppingBagMock') === '1') {
        window.sessionStorage.removeItem(MOCK_DISMISS_KEY);
        return true;
      }
      if (window.sessionStorage.getItem(MOCK_DISMISS_KEY) === '1') return false;
    } catch {
      /* ignore */
    }
  }

  if (import.meta.env.DEV) return true;
  if (isPreviewEnvironment()) return true;

  if (typeof window !== 'undefined') {
    try {
      return new URLSearchParams(window.location.search).get('shoppingBagMock') === '1';
    } catch {
      return false;
    }
  }
  return false;
}

function readStoredCartItems(): unknown[] {
  try {
    const stored = localStorage.getItem('cartItems');
    if (!stored) return [];
    const items = JSON.parse(stored);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function persistSeededMockCart(items: Record<string, unknown>[]): void {
  localStorage.setItem('cartItems', JSON.stringify(items));
  const count = items.reduce((sum, row) => sum + (Number(row.quantity) || 1), 0);
  localStorage.setItem('cartCount', String(count));
  window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: count }));
  window.dispatchEvent(new CustomEvent('cartItemsChanged'));
  window.dispatchEvent(new Event('cartUpdated'));
}

/** Seed shared mock lines into `localStorage` when enabled and the cart is empty. */
export function seedShoppingBagMockCartIfEmpty(): boolean {
  if (typeof window === 'undefined' || !isShoppingBagMockCartEnabled()) return false;
  if (readStoredCartItems().length > 0) return false;

  // Production (non-preview): only seed guests unless `?shoppingBagMock=1`.
  if (isSignedIn() && !isPreviewEnvironment() && !import.meta.env.DEV) {
    try {
      if (new URLSearchParams(window.location.search).get('shoppingBagMock') !== '1') return false;
    } catch {
      return false;
    }
  }

  try {
    const seeded = SHOPPING_BAG_MOCK_CART_ITEMS.map((row) => ({ ...row }));
    const giftMigrated = migrateGiftCardCartLinesForStorage(seeded);
    const strip = stripIneligibleBcfBundleDealLines(giftMigrated.next);
    const normalized = sortCartPremiumBookingFirst(
      strip.next.map((row) => attachStockStatusToLineItem(row)) as Parameters<
        typeof sortCartPremiumBookingFirst
      >[0],
    );
    persistSeededMockCart(normalized as Record<string, unknown>[]);
    return true;
  } catch {
    return false;
  }
}
