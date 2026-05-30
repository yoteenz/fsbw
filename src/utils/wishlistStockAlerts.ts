import { getNotificationsStorageKeyForUserEmail, type StoredNotification } from './orderAccountAlerts';
import {
  getBcfStockStatus,
  getWigProductStockStatus,
  isWigUnitProductName,
  PRODUCT_INVENTORY_UPDATED_EVENT,
  type ProductStockStatus,
} from './productInventoryAvailability';
import { normalizeCartLineProductName } from './cartCapSizeLineMargin';
import { getSignedInUserEmail } from './unitStockNotify';
import { getWishlistItemRoute } from './wishlistListItemDetails';
import { getWigUnitProductRoute } from './wigUnitProductRoutes';

export const WISHLIST_STOCK_ALERTS_UPDATED_EVENT = 'wishlistStockAlertsUpdated';

/** Single tracked key when any BCF line is on wishlist (BCF shares one packaging pool). */
export const WISHLIST_BCF_TRACK_KEY = 'BCF';

const STATUS_KEY_PREFIX = 'wishlistStockAlertLastStatus_';

function statusStorageKey(email: string): string {
  return `${STATUS_KEY_PREFIX}${email}`;
}

function todayMdy(): string {
  const d = new Date();
  return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
}

function readJsonArray(key: string): Record<string, unknown>[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

function isBcfWishlistLine(item: Record<string, unknown>): boolean {
  return String(item.type || '').toLowerCase() === 'shop-texture-category';
}

function normalizeUnitName(raw: unknown): string {
  return normalizeCartLineProductName({ name: String(raw ?? ''), productName: String(raw ?? '') });
}

function iterWishlistAndListItems(): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  out.push(...readJsonArray('wishlistItems'));
  try {
    const listsRaw = localStorage.getItem('userLists');
    const lists = listsRaw ? JSON.parse(listsRaw) : [];
    if (Array.isArray(lists)) {
      for (const list of lists) {
        const items = (list as { items?: Record<string, unknown>[] })?.items;
        if (Array.isArray(items)) out.push(...items);
      }
    }
  } catch {
    /* ignore */
  }
  return out;
}

/** Unique wig unit names on the active user's wishlist + saved lists. */
export function collectWishlistWigUnitNames(): string[] {
  const names = new Set<string>();
  for (const item of iterWishlistAndListItems()) {
    const n = normalizeUnitName(item.name ?? item.productName);
    if (n && isWigUnitProductName(n)) names.add(n);
  }
  return [...names];
}

function hasWishlistBcfItems(): boolean {
  return iterWishlistAndListItems().some(isBcfWishlistLine);
}

function getFirstWishlistBcfItem(): Record<string, unknown> | null {
  for (const item of iterWishlistAndListItems()) {
    if (isBcfWishlistLine(item)) return item;
  }
  return null;
}

/** Wig unit SKUs + optional BCF aggregate key for wishlist stock alert tracking. */
export function collectWishlistStockTrackKeys(): string[] {
  const keys = collectWishlistWigUnitNames();
  if (hasWishlistBcfItems()) keys.push(WISHLIST_BCF_TRACK_KEY);
  return keys;
}

function stockStatusForTrackKey(trackKey: string): ProductStockStatus {
  if (trackKey === WISHLIST_BCF_TRACK_KEY) return getBcfStockStatus();
  return getWigProductStockStatus(trackKey);
}

function actionRouteForTrackKey(trackKey: string): string {
  if (trackKey === WISHLIST_BCF_TRACK_KEY) {
    const bcf = getFirstWishlistBcfItem();
    return bcf ? getWishlistItemRoute(bcf) : '/home/shop';
  }
  return getWigUnitProductRoute(trackKey);
}

function loadLastStatuses(email: string): Record<string, ProductStockStatus> {
  try {
    const raw = localStorage.getItem(statusStorageKey(email));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, ProductStockStatus>) : {};
  } catch {
    return {};
  }
}

function saveLastStatuses(email: string, state: Record<string, ProductStockStatus>): void {
  localStorage.setItem(statusStorageKey(email), JSON.stringify(state));
}

function appendWishlistStockAlert(
  email: string,
  kind: 'low_stock' | 'back_in_stock',
  trackKey: string
): void {
  const id = `wishlist_${kind}_${trackKey.replace(/\s+/g, '_')}`;
  const title = kind === 'low_stock' ? 'LOW STOCK: ACT FAST!' : 'BACK IN STOCK: SHOP NOW!';
  const message =
    kind === 'low_stock'
      ? 'YOUR WISHLIST ITEM IS LOW IN STOCK.'
      : 'YOUR WISHLIST ITEM IS BACK IN STOCK.';

  const item: StoredNotification = {
    id,
    title,
    message,
    actionText: 'VIEW PRODUCT',
    actionRoute: actionRouteForTrackKey(trackKey),
    date: todayMdy(),
    sortAt: Date.now(),
    isRead: false,
    icon: 'f',
  };

  const key = getNotificationsStorageKeyForUserEmail(email);
  try {
    const raw = localStorage.getItem(key);
    const existing: StoredNotification[] = raw && Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    const merged = [item, ...existing.filter((n) => n.id !== id)];
    localStorage.setItem(key, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
    window.dispatchEvent(new CustomEvent(WISHLIST_STOCK_ALERTS_UPDATED_EVENT));
    window.dispatchEvent(new Event('storage'));
  } catch {
    /* ignore */
  }
}

/** Low-stock alert on transition or when first tracked while already low (matches wishlist banner). */
function shouldAlertLowStock(prev: ProductStockStatus | undefined, current: ProductStockStatus): boolean {
  if (current !== 'low_stock') return false;
  if (prev === undefined) return true;
  return prev === 'in_stock';
}

function shouldAlertBackInStock(prev: ProductStockStatus | undefined, current: ProductStockStatus): boolean {
  if (current !== 'in_stock') return false;
  return prev === 'out_of_stock' || prev === 'low_stock';
}

function processTrackKey(
  email: string,
  trackKey: string,
  prevByKey: Record<string, ProductStockStatus>,
  nextByKey: Record<string, ProductStockStatus>
): void {
  const current = stockStatusForTrackKey(trackKey);
  const prev = prevByKey[trackKey];

  if (shouldAlertLowStock(prev, current)) {
    appendWishlistStockAlert(email, 'low_stock', trackKey);
  } else if (shouldAlertBackInStock(prev, current)) {
    appendWishlistStockAlert(email, 'back_in_stock', trackKey);
  }

  nextByKey[trackKey] = current;
}

/**
 * Compare wishlist inventory to last-seen status; append Account → Alerts rows.
 * Wig units + BCF (when on wishlist/lists). Alerts on transition and when first seen already low.
 */
export function processWishlistStockAlertsForSignedInUser(): void {
  if (typeof window === 'undefined') return;
  const email = getSignedInUserEmail();
  if (!email) return;

  const trackKeys = collectWishlistStockTrackKeys();
  const prevByKey = loadLastStatuses(email);
  const nextByKey: Record<string, ProductStockStatus> = { ...prevByKey };

  for (const trackKey of trackKeys) {
    processTrackKey(email, trackKey, prevByKey, nextByKey);
  }

  for (const key of Object.keys(nextByKey)) {
    if (!trackKeys.includes(key)) {
      delete nextByKey[key];
    }
  }

  saveLastStatuses(email, nextByKey);
}

export function subscribeWishlistStockAlertsListeners(): () => void {
  if (typeof window === 'undefined') return () => {};
  const run = () => processWishlistStockAlertsForSignedInUser();
  window.addEventListener(PRODUCT_INVENTORY_UPDATED_EVENT, run);
  window.addEventListener('wishlistUpdated', run);
  window.addEventListener('userListsUpdated', run);
  window.addEventListener('signInStateChanged', run);
  run();
  return () => {
    window.removeEventListener(PRODUCT_INVENTORY_UPDATED_EVENT, run);
    window.removeEventListener('wishlistUpdated', run);
    window.removeEventListener('userListsUpdated', run);
    window.removeEventListener('signInStateChanged', run);
  };
}
