import { isBookingCartLine } from './bookingCheckout';
import { isGiftCardCartLine } from './giftCardCheckout';
import { isSlayTicketPackCartLine } from './slayTicketCheckout';
import { isPremiumMemberForGatedFeatures } from './premiumMemberAccess';

/**
 * Pick the checkout URL for the current bag: isolated routes for A/C-only, gift-card-only, or slay-ticket-only carts.
 */
export function checkoutPathForCartItems(items: { type?: string; name?: string; slayTicketProduct?: boolean }[]): string {
  if (!items || items.length === 0) return '/checkout';
  if (items.every((i) => isBookingCartLine(i))) return '/checkout/bookings';
  if (items.every((i) => isGiftCardCartLine(i))) return '/checkout/gift-card';
  if (isPremiumMemberForGatedFeatures() && items.every((i) => isSlayTicketPackCartLine(i))) {
    return '/checkout/slay-tickets';
  }
  return '/checkout';
}
