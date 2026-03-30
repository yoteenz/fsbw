/** Premium booking (lobby `/booking/premium/*`) — sort first in bag for fulfillment / alert priority over standard `/booking/*`. */
export function isPremiumBookingCartItem(item: { bookingTier?: string }): boolean {
  return item?.bookingTier === 'premium';
}

/** Higher = earlier in list among premium rows (appointment before consult). */
function premiumBookingSortWeight(item: { type?: string }): number {
  if (item?.type === 'booking-appointment') return 2;
  if (item?.type === 'booking-consult') return 1;
  return 0;
}

export function sortCartPremiumBookingFirst<T extends { bookingTier?: string; type?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ap = isPremiumBookingCartItem(a);
    const bp = isPremiumBookingCartItem(b);
    if (ap !== bp) return Number(bp) - Number(ap);
    if (ap && bp) return premiumBookingSortWeight(b) - premiumBookingSortWeight(a);
    return 0;
  });
}
