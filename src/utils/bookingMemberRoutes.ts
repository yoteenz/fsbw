import { getEffectiveSubscriptionTier, getEffectiveTierName } from './adminAuth';

/**
 * Same idea as lobby `isPremiumMember`: active subscription / PREMIUM membership or BLACK tier
 * → use `/booking/premium/*` from SHOP menu; otherwise `/booking/*` (standard).
 */
export function bookingMenuUsesPremiumPaths(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem('isSignedIn') !== 'true') return false;
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return false;
    const user = JSON.parse(raw) as {
      email?: string;
      subscriptionTier?: string;
      membershipType?: string;
      currentTierName?: string;
      tier?: string;
    };
    if (getEffectiveSubscriptionTier(user) != null) return true;
    const tier = (getEffectiveTierName(user) || '').toUpperCase();
    return tier === 'BLACK';
  } catch {
    return false;
  }
}

export function bookingAppointmentHref(): string {
  return bookingMenuUsesPremiumPaths() ? '/booking/premium/appointment' : '/booking/appointment';
}

export function bookingConsultationHref(): string {
  return bookingMenuUsesPremiumPaths() ? '/booking/premium/consultation' : '/booking/consultation';
}

/** Re-open the booking PDP that matches how the line was added to the bag. */
export function bookingAppointmentHrefForCartItem(item: { bookingTier?: string }): string {
  return item.bookingTier === 'premium' ? '/booking/premium/appointment' : '/booking/appointment';
}

export function bookingConsultationHrefForCartItem(item: { bookingTier?: string }): string {
  return item.bookingTier === 'premium' ? '/booking/premium/consultation' : '/booking/consultation';
}
