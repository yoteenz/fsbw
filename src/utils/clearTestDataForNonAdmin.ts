/**
 * Clear test/created data for signed-in accounts that are NOT the protected admin (ayoteenz@yahoo.com with admin tag).
 * Non-signed-in users (e.g. Kristen Watson on preview server) are unaffected—we only run when there is a current user.
 * Runs once per email (versioned flag) so we remove existing test data but don't wipe future real data.
 */

import { isMockDataAccount } from './adminAuth';

const CLEARED_FLAG_PREFIX = '_clearedTestData_v1_';

function getEmailKey(email: string): string {
  return (email || '').trim().toLowerCase();
}

/** Per-email localStorage keys that hold test/created data we clear for non-admin accounts. */
function keysToClearForEmail(email: string): string[] {
  const e = getEmailKey(email);
  if (!e) return [];
  return [
    `userOrders_${e}`,
    `notifications_${e}`,
    `alertsPageViewed_${e}`,
    `lastKnownTier_${e}`,
    `subscriptionUpdate_${e}`,
    `referralNewActivity_${e}`,
    `referralLastSeenCount_${e}`,
  ];
}

/**
 * Clear concierge "order seen" flags for orders that belong to this user (so badge state is consistent).
 * Call before removing userOrders so we have order ids.
 */
function clearConciergeSeenForUserOrders(email: string): void {
  try {
    const e = getEmailKey(email);
    const raw = localStorage.getItem(`userOrders_${e}`);
    if (!raw) return;
    const data = JSON.parse(raw);
    const orders = [...(data.activeOrders || []), ...(data.pastOrders || [])];
    const CONCIERGE_TRACKING_STATUSES = [
      'PLACED', 'CONFIRMED', 'PREPARING', 'SHIPPED_TO_HUB', 'IN_TRANSIT',
      'PROCESSING', 'CUSTOMIZING', 'FINALIZING', 'SHIPPED', 'DELIVERED',
    ];
    orders.forEach((order: { id?: string; status?: string }) => {
      if (order?.id && order?.status && CONCIERGE_TRACKING_STATUSES.includes(order.status)) {
        localStorage.removeItem(`conciergeOrderSeen_${order.id}_${order.status}`);
      }
    });
  } catch (_) {
    // ignore
  }
}

/**
 * If the current signed-in user is NOT the ayoteenz admin (with admin tag), clear their test data once.
 * Does nothing when not signed in (non-signed-in Kristen Watson on preview is unaffected).
 */
export function clearTestDataForNonAdminUserIfNeeded(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
    if (!isSignedIn) return;
    const raw = localStorage.getItem('currentUser');
    if (!raw) return;
    const user = JSON.parse(raw);
    if (!user || typeof user !== 'object' || !user.email) return;
    if (isMockDataAccount(user)) return;
    const email = getEmailKey(user.email);
    if (!email) return;
    const flagKey = CLEARED_FLAG_PREFIX + email;
    if (localStorage.getItem(flagKey) === 'true') return;
    clearConciergeSeenForUserOrders(email);
    keysToClearForEmail(email).forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(flagKey, 'true');
  } catch (_) {
    // ignore
  }
}
