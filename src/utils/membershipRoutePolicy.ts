/**
 * Single source of truth for **premium vs standard booking URLs** and how they map to
 * `isPremiumMemberForGatedFeatures()` (`premiumMemberAccess.ts`).
 *
 * **Applied at runtime:** `MembershipRouteSync` in `App.tsx` runs sync + canonical redirects
 * on the paths below whenever the location or auth state changes.
 *
 * **Elsewhere (not path-redirected here):**
 * - SHOP menu / deep links: `bookingMemberRoutes.ts` (`bookingConsultationHref`, `bookingAppointmentHref`, …).
 * - Build-a-wig premium steps: `useBuildWigPremiumMembershipStepGate`.
 * - Lobby lounge: `LobbyApp` + `isPremiumMemberForGatedFeatures`.
 * - Cart eligibility: `stripIneligibleBcfBundleDealLines` / `isPremiumGatedCartLine`.
 */

export const BOOKING_PATHS = {
  STANDARD_CONSULT: '/booking/consultation',
  PREMIUM_CONSULT: '/booking/premium/consultation',
  /** Legacy / short URL — normalized to `PREMIUM_CONSULT`. */
  PREMIUM_CONSULT_ALIAS: '/booking/premium/consult',
  STANDARD_APPOINTMENT: '/booking/appointment',
  PREMIUM_APPOINTMENT: '/booking/premium/appointment'
} as const;

export const BOOKING_MEMBERSHIP_SCOPED_PATHS = [
  BOOKING_PATHS.STANDARD_CONSULT,
  BOOKING_PATHS.PREMIUM_CONSULT,
  BOOKING_PATHS.PREMIUM_CONSULT_ALIAS,
  BOOKING_PATHS.STANDARD_APPOINTMENT,
  BOOKING_PATHS.PREMIUM_APPOINTMENT
] as const;

export type BookingMembershipScopedPath = (typeof BOOKING_MEMBERSHIP_SCOPED_PATHS)[number];

export function isBookingMembershipScopedPath(pathname: string): pathname is BookingMembershipScopedPath {
  return (BOOKING_MEMBERSHIP_SCOPED_PATHS as readonly string[]).includes(pathname);
}

/**
 * After profile sync, return a **replace** navigation target when the URL should match membership.
 * Does **not** redirect non-premium users away from premium consult URLs (page shows area modal).
 */
export function resolveBookingMembershipRedirect(pathname: string, isPremium: boolean): string | null {
  if (pathname === BOOKING_PATHS.PREMIUM_CONSULT_ALIAS) {
    return BOOKING_PATHS.PREMIUM_CONSULT;
  }
  if (!isPremium) {
    return null;
  }
  if (pathname === BOOKING_PATHS.STANDARD_CONSULT) {
    return BOOKING_PATHS.PREMIUM_CONSULT;
  }
  if (pathname === BOOKING_PATHS.STANDARD_APPOINTMENT) {
    return BOOKING_PATHS.PREMIUM_APPOINTMENT;
  }
  return null;
}

/** Canonical consult URL for menu / cart helpers (premium vs standard). */
export function bookingConsultPathForTier(premium: boolean): string {
  return premium ? BOOKING_PATHS.PREMIUM_CONSULT : BOOKING_PATHS.STANDARD_CONSULT;
}

/** Hair install is premium-only; non-premium users still land on standard URL and are gated in-page. */
export function bookingAppointmentPathForMenu(premium: boolean): string {
  return premium ? BOOKING_PATHS.PREMIUM_APPOINTMENT : BOOKING_PATHS.STANDARD_APPOINTMENT;
}
