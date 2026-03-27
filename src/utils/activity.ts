/**
 * Client activity tracking for the admin Activity tab.
 * Call these from the app when the user performs trackable actions.
 * Events are stored in user_activity and visible to admins on the client detail Activity tab.
 */
import { recordActivity as apiRecordActivity } from './api';

export type ActivityEventType =
  | 'sign_in'
  | 'sign_out'
  | 'sign_up'
  | 'view_product'
  | 'view_page'
  | 'add_to_cart'
  | 'add_to_wishlist'
  | 'remove_from_cart'
  | 'remove_from_wishlist'
  | 'place_order'
  | 'cancel_order'
  | 'add_review'
  | 'redeem_points'
  | 'profile_update'
  | 'checkout_start'
  | 'checkout_complete'
  | 'cart_snapshot'
  | 'wishlist_snapshot'
  | 'cloud_sync'
  | 'membership_checkout_start'
  | 'membership_upgrade_checkout'
  | 'membership_stripe_return'
  | 'open_cart_dropdown'
  | 'cart_navigate';

/** Record an activity event (no-op if API not configured or user not signed in). */
export function trackActivity(eventType: ActivityEventType, payload?: Record<string, unknown>): void {
  apiRecordActivity(eventType, payload).catch(() => {});
}

/**
 * Dispatch a trackable activity from anywhere without importing this module in the caller site
 * (handler is registered in registerGlobalClientActivityListeners).
 */
export function emitClientActivityEvent(eventType: string, payload?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('bawTrackActivity', { detail: { eventType, payload } }));
}
