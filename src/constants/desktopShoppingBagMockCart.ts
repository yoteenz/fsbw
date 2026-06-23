/** Display-only cart lines for `/desktop/shopping-bag` UI QA — not written to localStorage. */
export const DESKTOP_SHOPPING_BAG_MOCK_CART_ITEMS: Record<string, unknown>[] = [
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

/**
 * Mock collection for shopping bag UI testing when the real cart is empty.
 * - Local dev: on by default (`import.meta.env.DEV`)
 * - Staging / production: `?shoppingBagMock=1`
 */
export function isDesktopShoppingBagMockEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('shoppingBagMock') === '1';
  } catch {
    return false;
  }
}
