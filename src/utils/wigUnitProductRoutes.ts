import { normalizeCartLineProductName } from './cartCapSizeLineMargin';

const WIG_UNIT_PRODUCT_ROUTES: Record<string, string> = {
  NOIR: '/straight/noir',
  BLANCO: '/straight/blanco',
  'SOFT WAVE': '/wavy/soft-wave',
  'BEACH WAVE': '/wavy/beach-wave',
  'SOFT CURL': '/curly/soft-curl',
  'OCEAN CURL': '/curly/ocean-curl',
};

/** PDP route for a build-a-wig unit SKU (wishlist alerts, cart links). */
export function getWigUnitProductRoute(productName?: string): string {
  const name = normalizeCartLineProductName({ name: productName, productName });
  if (!name) return '/home/shop';
  return WIG_UNIT_PRODUCT_ROUTES[name] ?? '/home/shop';
}
