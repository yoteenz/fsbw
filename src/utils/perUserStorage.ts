/**
 * Per-user localStorage keys so account/site preferences don't bleed between users.
 * Use these instead of single global keys (e.g. selectedCurrency, profileImage) when the
 * value is specific to the signed-in user. When email is null/undefined, returns the
 * legacy key for backwards compatibility (e.g. guest or pre-migration).
 */

function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

/**
 * Returns a localStorage key scoped to the user when email is present; otherwise the legacy global key.
 * Use for reading/writing preferences that should be per-user (currency, animations, notifications, etc.).
 */
export function getPerUserKey(
  prefix: string,
  email: string | null | undefined
): string {
  const e = normalizeEmail(email);
  return e ? `${prefix}_${e}` : prefix;
}

/** Per-user keys used across the app (prefixes only; call getPerUserKey(prefix, email) for full key). */
export const PER_USER_KEYS = {
  selectedCurrency: 'selectedCurrency',
  ordersPageAnimationsEnabled: 'ordersPageAnimationsEnabled',
  hasUnreadNotifications: 'hasUnreadNotifications',
  referralEarnings: 'referralEarnings',
  affiliateSubmittedContent: 'affiliateSubmittedContent',
  notifications: 'notifications',
} as const;

/**
 * Get current user email from localStorage (currentUser). Use when you don't have userData in scope.
 */
export function getCurrentUserEmailFromStorage(): string | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    if (!raw) return null;
    const user = JSON.parse(raw) as { email?: string };
    const email = (user?.email ?? '').trim();
    return email || null;
  } catch {
    return null;
  }
}
