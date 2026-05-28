/** Fields used for cart line spacing (CAP SIZE line + price). */
export type CartLineRedSubtitleItem = {
  name?: string;
  type?: string;
};

/** Gap above red RAW line under script product name (cart, bag, wishlist list). */
export const CART_LINE_RAW_GAP_ABOVE_PX = 3;

/** margin-top on cart/bag red subtitle (RAW build-a-wig units; gift/booking/BCF unchanged at 2px). */
export function cartLineRawSubtitleMarginTop(item?: CartLineRedSubtitleItem): string {
  if (item?.type === 'gift-card' || item?.name === 'GIFT CARD') return '2px';
  if (item?.type === 'booking-consult' || item?.type === 'booking-appointment') return '2px';
  if (item?.type === 'shop-texture-category') return '2px';
  return `${CART_LINE_RAW_GAP_ABOVE_PX}px`;
}

export type CartLineSpacingItem = {
  name?: string;
  density?: string;
  lace?: string;
  texture?: string;
  color?: string;
  hairline?: string;
  styling?: string;
  addOns?: string[];
};

/** True when the line has non-default build specs (Blanco default density = 250%). */
export function cartItemHasNonDefaultSpecs(item: CartLineSpacingItem): boolean {
  const isWavyProduct = item.name === 'SOFT WAVE' || item.name === 'BEACH WAVE';
  const isCurlyProduct = item.name === 'SOFT CURL' || item.name === 'OCEAN CURL';
  const defaultTexture = isWavyProduct ? 'WAVY' : isCurlyProduct ? 'CURLY' : 'SILKY';
  const defaultDensity = item.name === 'BLANCO' ? '250%' : '200%';
  return (
    (item.density && item.density !== defaultDensity) ||
    (item.lace && item.lace !== '13X6') ||
    (item.texture && item.texture !== defaultTexture) ||
    (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) ||
    (item.hairline && item.hairline !== 'NATURAL') ||
    (item.styling && item.styling !== 'NONE') ||
    Boolean(item.addOns && item.addOns.length > 0)
  );
}

/** Margin above gray CAP SIZE line (cart dropdown + shopping bag cards). */
export function cartCapSizeLineMarginTop(item: CartLineSpacingItem): string {
  const hasSpecs = cartItemHasNonDefaultSpecs(item);
  let px = hasSpecs ? 2 : 0;
  if (item.name === 'SOFT WAVE' || item.name === 'SOFT CURL') px += 2;
  if (item.name === 'OCEAN CURL') px += 2;
  px += 2;
  return `${px}px`;
}

/** Margin above line price (below CAP SIZE); bag + cart dropdown parity. */
export function cartLinePriceMarginTop(item: CartLineSpacingItem): string {
  return item.name === 'BLANCO' ? '2px' : '2px';
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
  return {
    fontFamily: '"Futura PT Medium"',
    color: '#808080',
    textTransform: 'uppercase',
    fontSize: '10px',
    marginTop: cartCapSizeLineMarginTop(item),
    marginBottom: '0',
    lineHeight: 1.1,
  };
}
