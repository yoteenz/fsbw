import { isBookingCartLine } from './bookingCheckout';
import { isGiftCardCartLine } from './giftCardCheckout';
import { isSlayTicketPackCartLine } from './slayTicketCheckout';
import { isPremiumMemberForGatedFeatures } from './premiumMemberAccess';

const DESKTOP_ACQUISITION_BASE = '/desktop/acquisition';

/** Desktop Curator's Tablet acquisition route for the current bag. */
export function desktopAcquisitionPathForCartItems(
  items: { type?: string; name?: string; slayTicketProduct?: boolean }[],
): string {
  if (!items || items.length === 0) return DESKTOP_ACQUISITION_BASE;
  if (items.every((i) => isBookingCartLine(i))) return `${DESKTOP_ACQUISITION_BASE}/bookings`;
  if (items.every((i) => isGiftCardCartLine(i))) return `${DESKTOP_ACQUISITION_BASE}/gift-card`;
  if (isPremiumMemberForGatedFeatures() && items.every((i) => isSlayTicketPackCartLine(i))) {
    return `${DESKTOP_ACQUISITION_BASE}/slay-tickets`;
  }
  return DESKTOP_ACQUISITION_BASE;
}
