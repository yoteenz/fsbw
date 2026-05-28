/** Fields used for cart line spacing (CAP SIZE line + price). */
export type CartLineRedSubtitleItem = {
  name?: string;
  productName?: string;
  type?: string;
};

export type CartLineSpacingItem = CartLineRedSubtitleItem & {
  density?: string;
  lace?: string;
  texture?: string;
  color?: string;
  hairline?: string;
  styling?: string;
  addOns?: string[];
};

/** Canonical unit name (NOIR, BLANCO, …) for spacing helpers. */
export function normalizeCartLineProductName(item?: {
  name?: string;
  productName?: string;
}): string {
  const raw = (item?.name ?? item?.productName ?? '').toString().trim();
  if (!raw) return '';
  return raw.toUpperCase().replace(/\s*WIG\s*/gi, '').trim();
}

/** Merge display name onto item so BLANCO spacing works when only `productName` is set. */
export function withNormalizedCartLineName<T extends { name?: string; productName?: string }>(
  item: T,
  displayName?: string
): T & { name: string } {
  const name = (displayName || normalizeCartLineProductName(item) || 'NOIR').toUpperCase();
  return { ...item, name };
}

/** Gap above red RAW line for NOIR (reference spacing — cart, bag, wishlist). */
export const CART_LINE_RAW_GAP_ABOVE_PX = 3;

/** All other build-a-wig units: +2px above RAW vs NOIR (Blanco, curls, waves, etc.). */
export const CART_LINE_RAW_GAP_ABOVE_NON_NOIR_PX = CART_LINE_RAW_GAP_ABOVE_PX + 2;

/** margin-top on cart/bag red subtitle (RAW build-a-wig units; gift/booking/BCF unchanged at 2px). */
export function cartLineRawSubtitleMarginTop(item?: CartLineRedSubtitleItem): string {
  const type = item?.type;
  const name = normalizeCartLineProductName(item);
  if (type === 'gift-card' || name === 'GIFT CARD') return '2px';
  if (type === 'booking-consult' || type === 'booking-appointment') return '2px';
  if (type === 'shop-texture-category') return '2px';
  if (name === 'NOIR') return `${CART_LINE_RAW_GAP_ABOVE_PX}px`;
  return `${CART_LINE_RAW_GAP_ABOVE_NON_NOIR_PX}px`;
}

/** True when the line has non-default build specs (Blanco default density = 250%). */
export function cartItemHasNonDefaultSpecs(item: CartLineSpacingItem): boolean {
  const name = normalizeCartLineProductName(item) || item.name;
  const isWavyProduct = name === 'SOFT WAVE' || name === 'BEACH WAVE';
  const isCurlyProduct = name === 'SOFT CURL' || name === 'OCEAN CURL';
  const defaultTexture = isWavyProduct ? 'WAVY' : isCurlyProduct ? 'CURLY' : 'SILKY';
  const defaultDensity = name === 'BLANCO' ? '250%' : '200%';
  return (
    (item.density && item.density !== defaultDensity) ||
    (item.lace && item.lace !== '13X6') ||
    (item.texture && item.texture !== defaultTexture) ||
    (item.color && item.color !== (name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) ||
    (item.hairline && item.hairline !== 'NATURAL') ||
    (item.styling && item.styling !== 'NONE') ||
    Boolean(item.addOns && item.addOns.length > 0)
  );
}

/** Margin above gray CAP SIZE line (cart dropdown + shopping bag cards). */
export function cartCapSizeLineMarginTop(item: CartLineSpacingItem): string {
  const name = normalizeCartLineProductName(item) || item.name;
  const hasSpecs = cartItemHasNonDefaultSpecs({ ...item, name });
  let px = hasSpecs ? 2 : 0;
  if (name === 'SOFT WAVE' || name === 'SOFT CURL') px += 2;
  if (name === 'OCEAN CURL') px += 2;
  px += 2;
  return `${px}px`;
}

/** Margin above line price (below CAP SIZE); bag + cart dropdown parity. */
export function cartLinePriceMarginTop(item: CartLineSpacingItem): string {
  const name = normalizeCartLineProductName(item);
  return name === 'BLANCO' ? '2px' : '2px';
}

/** Gray CAP SIZE line styles (cart, bag, wishlist). */
export function cartLineCapSizeParagraphStyle(item: CartLineSpacingItem): {
  fontFamily: string;
  color: string;
  textTransform: 'uppercase';
  fontSize: string;
  marginTop: string;
  marginBottom: string;
  lineHeight: number;
} {
  const normalized = withNormalizedCartLineName(item);
  return {
    fontFamily: '"Futura PT Medium"',
    color: '#808080',
    textTransform: 'uppercase',
    fontSize: '10px',
    marginTop: cartCapSizeLineMarginTop(normalized),
    marginBottom: '0',
    lineHeight: 1.1,
  };
}
