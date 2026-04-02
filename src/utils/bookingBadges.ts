/**
 * PNG badges under booking flow header and as cart thumbnails on checkout / summary.
 * Assets: `public/assets/appointment-premium.png`, `appointment-standard.png`,
 * `consultation-premium.png`, `consultation-standard.png`.
 *
 * Display size matches Account → Rewards `premium-rewards.png` frame (membership page).
 */
export const BOOKING_BADGE_DISPLAY_PX = 182.16;

/**
 * Consult header PNGs read shorter than appointment at the same box size (wider artwork in-frame).
 * Use a slightly larger square on booking consult pages only so vertical presence matches appointment.
 */
export const BOOKING_BADGE_HEADER_CONSULT_PX = 198;

/** Appointment booking flow page only (`BookingTierBadgeImg`); 5% larger than base display. */
export const BOOKING_BADGE_HEADER_APPOINTMENT_PX = BOOKING_BADGE_DISPLAY_PX * 1.05;

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

/** Cart dropdown / bag / order strip: consult + install badge image (square). */
export const BOOKING_CART_BADGE_IMG_PX = 66;
/** `booking-appointment` only: 5% larger than consult in those UIs. */
export const BOOKING_APPOINTMENT_CART_BADGE_IMG_PX = Math.round(BOOKING_CART_BADGE_IMG_PX * 1.05);
