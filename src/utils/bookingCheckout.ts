/** Appointment + consult cart line types — isolated checkout at `/checkout/bookings`. */
export const BOOKING_CART_TYPES = ['booking-appointment', 'booking-consult'] as const;

export type BookingCartType = (typeof BOOKING_CART_TYPES)[number];

export function isBookingCartLine(item: { type?: string } | null | undefined): boolean {
  const t = (item?.type || '').trim();
  return BOOKING_CART_TYPES.includes(t as BookingCartType);
}

export function filterBookingCartLines<T extends { type?: string }>(items: T[]): T[] {
  return (items || []).filter((i) => isBookingCartLine(i));
}

export function isBookingsCheckoutPath(pathname: string): boolean {
  return pathname.includes('/checkout/bookings');
}

/** True when `/checkout/bookings` is showing a non-empty cart of only A/C lines (appointment + consult). */
export function isBookingsOnlyCheckoutState(pathname: string, items: { type?: string }[]): boolean {
  return isBookingsCheckoutPath(pathname) && items.length > 0 && items.every((i) => isBookingCartLine(i));
}
