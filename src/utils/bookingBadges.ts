/**
 * PNG badges under booking flow header and as cart thumbnails on checkout / summary.
 * Assets: `public/assets/appointment-premium.png`, `appointment-standard.png`,
 * `consultation-premium.png`, `consultation-standard.png`.
 *
 * Display size matches Account → Rewards `premium-rewards.png` frame (membership page).
 */
export const BOOKING_BADGE_DISPLAY_PX = 182.16;

/** Cart row width for booking badge thumbs (thumb + horizontal padding). */
export const BOOKING_BADGE_CART_CELL_WIDTH_PX = Math.ceil(BOOKING_BADGE_DISPLAY_PX + 16);

/** Lowercase/snake_case aliases — some bundles or mistaken imports expect these binding names. */
export const booking_badge_display_px = BOOKING_BADGE_DISPLAY_PX;
export const booking_badge_cart_cell_width_px = BOOKING_BADGE_CART_CELL_WIDTH_PX;

export function bookingPageHeaderBadgeSrc(pathname: string): string | null {
  const p = pathname.toLowerCase();
  if (!p.includes('/booking/')) return null;
  const premium = p.includes('/booking/premium/');
  if (p.includes('consult')) {
    return `/assets/${premium ? 'consultation-premium' : 'consultation-standard'}.png`;
  }
  if (p.includes('appointment')) {
    return `/assets/${premium ? 'appointment-premium' : 'appointment-standard'}.png`;
  }
  return null;
}

export function bookingCartItemThumbnailSrc(item: { type?: string; bookingTier?: string }): string | null {
  if (!item?.type) return null;
  const premium = item.bookingTier === 'premium';
  if (item.type === 'booking-appointment') {
    return `/assets/${premium ? 'appointment-premium' : 'appointment-standard'}.png`;
  }
  if (item.type === 'booking-consult') {
    return `/assets/${premium ? 'consultation-premium' : 'consultation-standard'}.png`;
  }
  return null;
}

export function isBookingCartBadgeItem(item: { type?: string }): boolean {
  return item?.type === 'booking-appointment' || item?.type === 'booking-consult';
}
