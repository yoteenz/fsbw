import { getNotificationsStorageKeyForUserEmail, type StoredNotification } from './orderAccountAlerts';
import { isWigUnitSoldOut, PRODUCT_INVENTORY_UPDATED_EVENT } from './productInventoryAvailability';
import { normalizeCartLineProductName } from './cartCapSizeLineMargin';

export const UNIT_STOCK_NOTIFY_WAITLIST_KEY = 'unitStockNotifyWaitlist_v1';
export const UNIT_STOCK_NOTIFY_UPDATED_EVENT = 'unitStockNotifyUpdated';

export type UnitStockNotifyWaitlistEntry = {
  email: string;
  productName: string;
  createdAt: number;
};

function normalizeUnitName(productName: string): string {
  return normalizeCartLineProductName({ name: productName, productName }) || String(productName || '').trim().toUpperCase();
}

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function loadUnitStockNotifyWaitlist(): UnitStockNotifyWaitlistEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(UNIT_STOCK_NOTIFY_WAITLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as UnitStockNotifyWaitlistEntry[]) : [];
  } catch {
    return [];
  }
}

function saveUnitStockNotifyWaitlist(entries: UnitStockNotifyWaitlistEntry[]): void {
  localStorage.setItem(UNIT_STOCK_NOTIFY_WAITLIST_KEY, JSON.stringify(entries));
}

function dispatchNotifyUpdated(): void {
  window.dispatchEvent(new CustomEvent(UNIT_STOCK_NOTIFY_UPDATED_EVENT));
  window.dispatchEvent(new Event('storage'));
}

function todayMdy(): string {
  const d = new Date();
  return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
}

function accountExistsForEmail(email: string): boolean {
  try {
    const raw = localStorage.getItem('registeredUsers');
    const users = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(users)) return false;
    return users.some((u) => normalizeEmail(u?.email) === email);
  } catch {
    return false;
  }
}

function appendStockNotifySignupAlert(email: string, unitName: string): void {
  const key = getNotificationsStorageKeyForUserEmail(email);
  const id = `stock_notify_signup_${unitName.replace(/\s+/g, '_')}`;
  const item: StoredNotification = {
    id,
    title: `${unitName} — BACK IN STOCK`,
    message: `WE'LL NOTIFY YOU WHEN ${unitName} IS AVAILABLE AGAIN.`,
    actionText: 'VIEW SHOP',
    actionRoute: '/home/shop',
    date: todayMdy(),
    sortAt: Date.now(),
    isRead: false,
    icon: 'f',
  };
  try {
    const raw = localStorage.getItem(key);
    const existing: StoredNotification[] = raw && Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    const merged = [item, ...existing.filter((n) => n.id !== id)];
    localStorage.setItem(key, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
  } catch {
    /* ignore */
  }
}

function appendBackInStockAlert(email: string, unitName: string): void {
  const key = getNotificationsStorageKeyForUserEmail(email);
  const id = `stock_back_in_stock_${unitName.replace(/\s+/g, '_')}_${Date.now()}`;
  const item: StoredNotification = {
    id,
    title: `${unitName} IS BACK IN STOCK`,
    message: `${unitName} IS AVAILABLE NOW — SHOP BEFORE IT SELLS OUT.`,
    actionText: 'SHOP NOW',
    actionRoute: '/home/shop',
    date: todayMdy(),
    sortAt: Date.now(),
    isRead: false,
    icon: 'f',
  };
  try {
    const raw = localStorage.getItem(key);
    const existing: StoredNotification[] = raw && Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    localStorage.setItem(key, JSON.stringify([item, ...existing]));
    window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
  } catch {
    /* ignore */
  }
}

export function getSignedInUserEmail(): string {
  try {
    if (localStorage.getItem('isSignedIn') !== 'true') return '';
    const raw = localStorage.getItem('currentUser');
    const u = raw ? JSON.parse(raw) : null;
    return normalizeEmail(u?.email || '');
  } catch {
    return '';
  }
}

export function registerUnitStockNotifyRequest(
  productName: string,
  emailInput: string
): { ok: boolean; message: string } {
  const unitName = normalizeUnitName(productName);
  const email = normalizeEmail(emailInput);
  if (!unitName) return { ok: false, message: 'INVALID PRODUCT.' };
  if (!isValidEmail(email)) return { ok: false, message: 'ENTER A VALID EMAIL ADDRESS.' };
  if (!isWigUnitSoldOut(unitName)) {
    return { ok: false, message: `${unitName} IS IN STOCK — YOU CAN ADD IT TO YOUR BAG.` };
  }

  const list = loadUnitStockNotifyWaitlist();
  const exists = list.some((e) => e.email === email && normalizeUnitName(e.productName) === unitName);
  if (!exists) {
    saveUnitStockNotifyWaitlist([...list, { email, productName: unitName, createdAt: Date.now() }]);
  }

  const signedInEmail = getSignedInUserEmail();
  if (signedInEmail === email || accountExistsForEmail(email)) {
    appendStockNotifySignupAlert(email, unitName);
  }

  dispatchNotifyUpdated();
  return {
    ok: true,
    message: exists
      ? `YOU'RE ALREADY ON THE LIST FOR ${unitName}.`
      : `WE'LL EMAIL YOU WHEN ${unitName} IS BACK IN STOCK.`,
  };
}

/** When inventory restocks a unit, notify waitlisted emails with account alerts. */
export function processUnitStockNotifyWaitlistOnInventoryUpdate(): void {
  if (typeof window === 'undefined') return;
  const list = loadUnitStockNotifyWaitlist();
  if (list.length === 0) return;

  const stillWaiting: UnitStockNotifyWaitlistEntry[] = [];
  for (const entry of list) {
    const unit = normalizeUnitName(entry.productName);
    if (isWigUnitSoldOut(unit)) {
      stillWaiting.push(entry);
      continue;
    }
    if (accountExistsForEmail(entry.email) || getSignedInUserEmail() === entry.email) {
      appendBackInStockAlert(entry.email, unit);
    }
  }

  if (stillWaiting.length !== list.length) {
    saveUnitStockNotifyWaitlist(stillWaiting);
    dispatchNotifyUpdated();
  }
}

export function subscribeUnitStockNotifyInventoryListener(): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => processUnitStockNotifyWaitlistOnInventoryUpdate();
  window.addEventListener(PRODUCT_INVENTORY_UPDATED_EVENT, handler);
  processUnitStockNotifyWaitlistOnInventoryUpdate();
  return () => window.removeEventListener(PRODUCT_INVENTORY_UPDATED_EVENT, handler);
}
