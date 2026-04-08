/**
 * Hair inspo photos submitted with consult checkout, persisted on `userOrders_*` orders.
 */
export function consultBookingInspoPhotoUrlsFromOrder(
  order: Record<string, unknown> | null | undefined
): string[] {
  if (!order || order.bookingFlowType !== 'consult') return [];
  const raw = order.bookingInspoPhotoUrls;
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
}
