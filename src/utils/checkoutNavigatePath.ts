import { isBookingCartLine } from './bookingCheckout';
import { isGiftCardCartLine } from './giftCardCheckout';

/**
 * Pick the checkout URL for the current bag: isolated routes for A/C-only or gift-card-only carts.
 */
export function checkoutPathForCartItems(items: { type?: string; name?: string }[]): string {
  if (!items || items.length === 0) return '/checkout';
  if (items.every((i) => isBookingCartLine(i))) return '/checkout/bookings';
  if (items.every((i) => isGiftCardCartLine(i))) return '/checkout/gift-card';
  return '/checkout';
}
