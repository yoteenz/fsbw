import { getNotificationsStorageKeyForUserEmail, type StoredNotification } from './orderAccountAlerts';
import {
  getWigProductStockStatus,
  isWigUnitProductName,
  PRODUCT_INVENTORY_UPDATED_EVENT,
  type ProductStockStatus,
} from './productInventoryAvailability';
import { normalizeCartLineProductName } from './cartCapSizeLineMargin';
import { getSignedInUserEmail } from './unitStockNotify';
import { getWigUnitProductRoute } from './wigUnitProductRoutes';

export const WISHLIST_STOCK_ALERTS_UPDATED_EVENT = 'wishlistStockAlertsUpdated';

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

function normalizeUnitName(raw: unknown): string {
  return normalizeCartLineProductName({ name: String(raw ?? ''), productName: String(raw ?? '') });
}

/** Unique wig unit names on the active user's wishlist + saved lists. */
export function collectWishlistWigUnitNames(): string[] {
  const names = new Set<string>();
  for (const item of readJsonArray('wishlistItems')) {
    const n = normalizeUnitName(item.name ?? item.productName);
    if (n && isWigUnitProductName(n)) names.add(n);
  }
  try {
    const listsRaw = localStorage.getItem('userLists');
    const lists = listsRaw ? JSON.parse(listsRaw) : [];
    if (Array.isArray(lists)) {
      for (const list of lists) {
        const items = (list as { items?: Record<string, unknown>[] })?.items;
        if (!Array.isArray(items)) continue;
        for (const item of items) {
          const n = normalizeUnitName(item.name ?? item.productName);
          if (n && isWigUnitProductName(n)) names.add(n);
        }
      }
    }
  } catch {
    /* ignore */
  }
  return [...names];
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
  unitName: string
): void {
  const id = `wishlist_${kind}_${unitName.replace(/\s+/g, '_')}`;
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
    actionRoute: getWigUnitProductRoute(unitName),
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

function shouldAlertLowStock(prev: ProductStockStatus | undefined, current: ProductStockStatus): boolean {
  return prev === 'in_stock' && current === 'low_stock';
}

function shouldAlertBackInStock(prev: ProductStockStatus | undefined, current: ProductStockStatus): boolean {
  if (current !== 'in_stock') return false;
  return prev === 'out_of_stock' || prev === 'low_stock';
}

/**
 * Compare wishlist unit inventory to last-seen status; append Account → Alerts rows on transitions.
 * Requires a signed-in user with wishlisted wig units.
 */
export function processWishlistStockAlertsForSignedInUser(): void {
  if (typeof window === 'undefined') return;
  const email = getSignedInUserEmail();
  if (!email) return;

  const units = collectWishlistWigUnitNames();
  const prevByUnit = loadLastStatuses(email);
  const nextByUnit: Record<string, ProductStockStatus> = { ...prevByUnit };

  for (const unit of units) {
    const current = getWigProductStockStatus(unit);
    const prev = prevByUnit[unit];

    if (prev === undefined) {
      nextByUnit[unit] = current;
      continue;
    }

    if (shouldAlertLowStock(prev, current)) {
      appendWishlistStockAlert(email, 'low_stock', unit);
    } else if (shouldAlertBackInStock(prev, current)) {
      appendWishlistStockAlert(email, 'back_in_stock', unit);
    }

    nextByUnit[unit] = current;
  }

  for (const key of Object.keys(nextByUnit)) {
    if (!units.includes(key)) {
      delete nextByUnit[key];
    }
  }

  saveLastStatuses(email, nextByUnit);
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
