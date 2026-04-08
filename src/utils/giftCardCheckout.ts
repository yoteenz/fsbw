/** Gift card cart lines — isolated checkout at `/checkout/gift-card`. */

export function isGiftCardCartLine(item: { type?: string; name?: string } | null | undefined): boolean {
  return item?.name === 'GIFT CARD' || item?.type === 'gift-card';
}

export function filterGiftCardCartLines<T extends { type?: string; name?: string }>(items: T[]): T[] {
  return (items || []).filter((i) => isGiftCardCartLine(i));
}

export function isGiftCardCheckoutPath(pathname: string): boolean {
  return pathname.includes('/checkout/gift-card');
}

/** True when `/checkout/gift-card` is showing a non-empty cart of only gift card lines. */
export function isGiftCardOnlyCheckoutState(
  pathname: string,
  items: { type?: string; name?: string }[]
): boolean {
  return isGiftCardCheckoutPath(pathname) && items.length > 0 && items.every((i) => isGiftCardCartLine(i));
}
