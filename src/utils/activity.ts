/**
 * Client activity tracking for the admin Activity tab.
 * Call these from the app when the user performs trackable actions.
 * Events are stored in user_activity and visible to admins on the client detail Activity tab.
 */
import { recordActivity as apiRecordActivity } from './api';

export type ActivityEventType =
  | 'sign_in'
  | 'sign_out'
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
  | 'checkout_complete';

/** Record an activity event (no-op if API not configured or user not signed in). */
export function trackActivity(eventType: ActivityEventType, payload?: Record<string, unknown>): void {
  apiRecordActivity(eventType, payload).catch(() => {});
}
