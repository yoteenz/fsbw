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
  | 'cart_navigate'
  /** Build-a-wig edit flow: saved customization to cart / wishlist / saved-for-later */
  | 'cart_item_updated'
  /** Shopping bag: moved line item to saved-for-later */
  | 'save_for_later'
  /** Shopping bag: moved a saved-for-later item back to cart */
  | 'move_saved_to_cart'
  /** Shopping bag: removed item from saved-for-later (not wishlist) */
  | 'remove_saved_item';

/** Runtime set for narrowing string event names (e.g. `bawTrackActivity` bridge). Keeps exhaustiveness with `ActivityEventType`. */
const ACTIVITY_EVENT_KEYS = {
  sign_in: true,
  sign_out: true,
  sign_up: true,
  view_product: true,
  view_page: true,
  add_to_cart: true,
  add_to_wishlist: true,
  remove_from_cart: true,
  remove_from_wishlist: true,
  place_order: true,
  cancel_order: true,
  add_review: true,
  redeem_points: true,
  profile_update: true,
  checkout_start: true,
  checkout_complete: true,
  cart_snapshot: true,
  wishlist_snapshot: true,
  cloud_sync: true,
  membership_checkout_start: true,
  membership_upgrade_checkout: true,
  membership_stripe_return: true,
  open_cart_dropdown: true,
  cart_navigate: true,
  cart_item_updated: true,
  save_for_later: true,
  move_saved_to_cart: true,
  remove_saved_item: true,
} satisfies Record<ActivityEventType, true>;

export function isActivityEventType(value: string): value is ActivityEventType {
  return Object.prototype.hasOwnProperty.call(ACTIVITY_EVENT_KEYS, value);
}

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
