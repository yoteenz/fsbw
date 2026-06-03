import { patchProfile, getAccessToken } from './api';
import { isSupabaseConfigured } from './supabase';
import { syncProfileFromApi } from './syncFromApi';

/**
 * After checkout: profile flags only. Orders are written by Stripe webhook (service role).
 */
export async function pushLocalUserOrdersAfterCheckout(
  _userOrdersKey: string,
  opts?: { markFirstPurchaseOnProfile?: boolean; stripePaymentIntentId?: string }
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (!(await getAccessToken())) return;
  try {
    if (opts?.markFirstPurchaseOnProfile && !opts?.stripePaymentIntentId) {
      await patchProfile({ hasMadeFirstPurchase: true });
    }
    if (opts?.stripePaymentIntentId) {
      // Webhook appends server order; refresh client from GET /api/orders on next sync.
    }
    await syncProfileFromApi().catch(() => {});
  } catch {
    /* non-fatal */
  }
}
