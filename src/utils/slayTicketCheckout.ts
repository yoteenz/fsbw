import { isSlayTicketPackCartLine, SLAY_TICKET_CART_LINE_NAME } from './slayTicketPacks';
import { SLAY_TICKET_CART_THUMBNAIL_SRC } from '../constants/slayTicketAssets';

export { isSlayTicketPackCartLine, SLAY_TICKET_CART_LINE_NAME };

export function slayTicketCartThumbnailSrc(): string {
  return SLAY_TICKET_CART_THUMBNAIL_SRC;
}

export function filterSlayTicketCartLines<T extends { type?: string; name?: string; slayTicketProduct?: boolean }>(
  items: T[]
): T[] {
  return (items || []).filter((i) => isSlayTicketPackCartLine(i));
}

export function isSlayTicketCheckoutPath(pathname: string): boolean {
  return pathname.includes('/checkout/slay-tickets') || pathname.includes('/desktop/acquisition/slay-tickets');
}

/** True when `/checkout/slay-tickets` is showing a non-empty cart of only Slay Ticket pack lines. */
export function isSlayTicketOnlyCheckoutState(
  pathname: string,
  items: { type?: string; name?: string; slayTicketProduct?: boolean }[]
): boolean {
  return isSlayTicketCheckoutPath(pathname) && items.length > 0 && items.every((i) => isSlayTicketPackCartLine(i));
}
