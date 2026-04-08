import { putOrders, patchProfile, getAccessToken } from './api';
import { isSupabaseConfigured } from './supabase';
import { syncProfileFromApi } from './syncFromApi';

/**
 * Mirror `userOrders_*` to the server after checkout (and optionally persist first-purchase on profile).
 */
export async function pushLocalUserOrdersAfterCheckout(
  userOrdersKey: string,
  opts?: { markFirstPurchaseOnProfile?: boolean }
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (!(await getAccessToken())) return;
  try {
    const raw = localStorage.getItem(userOrdersKey);
    const parsed = raw ? JSON.parse(raw) : { activeOrders: [], pastOrders: [] };
    const activeOrders = Array.isArray(parsed.activeOrders) ? parsed.activeOrders : [];
    const pastOrders = Array.isArray(parsed.pastOrders) ? parsed.pastOrders : [];
    await putOrders(activeOrders, pastOrders);
    if (opts?.markFirstPurchaseOnProfile) {
      await patchProfile({ hasMadeFirstPurchase: true });
    }
    await syncProfileFromApi().catch(() => {});
  } catch {
    /* non-fatal */
  }
}
