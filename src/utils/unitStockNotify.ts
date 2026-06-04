import { getNotificationsStorageKeyForUserEmail, type StoredNotification } from './orderAccountAlerts';
import { resolveAccountAlertCopy } from './copyDebugResolve';
import {
  isBcfSoldOut,
  isWigUnitSoldOut,
  PRODUCT_INVENTORY_UPDATED_EVENT,
} from './productInventoryAvailability';
import { normalizeCartLineProductName } from './cartCapSizeLineMargin';

export const UNIT_STOCK_NOTIFY_WAITLIST_KEY = 'unitStockNotifyWaitlist_v1';
export const UNIT_STOCK_NOTIFY_UPDATED_EVENT = 'unitStockNotifyUpdated';

export type UnitStockNotifyWaitlistEntry = {
  email: string;
  productName: string;
  createdAt: number;
};

const BCF_NOTIFY_PRODUCT_PATTERN = /^(BUNDLES|CLOSURES|FRONTALS)\s*·\s*(STRAIGHT|WAVY|CURLY)$/;

/** Cart / PDP label for BCF notify waitlist (e.g. `BUNDLES · STRAIGHT`). */
export function buildBcfNotifyProductName(
  category: 'bundles' | 'closures' | 'frontals',
  texture: 'straight' | 'wavy' | 'curly'
): string {
  const cat = category.toUpperCase();
  const tex = texture.toUpperCase();
  if (cat === 'BUNDLES') return `BUNDLES · ${tex}`;
  if (cat === 'CLOSURES') return `CLOSURES · ${tex}`;
  return `FRONTALS · ${tex}`;
}

export const BCF_NOTIFY_PRODUCT_NAMES: string[] = (
  ['BUNDLES', 'CLOSURES', 'FRONTALS'] as const
).flatMap((cat) =>
  (['STRAIGHT', 'WAVY', 'CURLY'] as const).map((tex) => {
    if (cat === 'BUNDLES') return `BUNDLES · ${tex}`;
    if (cat === 'CLOSURES') return `CLOSURES · ${tex}`;
    return `FRONTALS · ${tex}`;
  })
);

export function isBcfNotifyProductName(productName: string): boolean {
  const n = String(productName || '')
    .trim()
    .toUpperCase()
    .replace(/\s*·\s*/g, ' · ');
  return BCF_NOTIFY_PRODUCT_PATTERN.test(n);
}

function normalizeNotifyProductName(productName: string): string {
  const raw = String(productName || '')
    .trim()
    .toUpperCase()
    .replace(/\s*·\s*/g, ' · ');
  if (isBcfNotifyProductName(raw)) return raw;
  return normalizeCartLineProductName({ name: raw, productName: raw });
}

function normalizeUnitName(productName: string): string {
  return normalizeNotifyProductName(productName);
}

export function isProductSoldOutForStockNotify(productName: string): boolean {
  const name = normalizeNotifyProductName(productName);
  if (isBcfNotifyProductName(name)) return isBcfSoldOut();
  return isWigUnitSoldOut(name);
}

export function stockNotifyProductActionRoute(productName: string): string {
  const name = normalizeNotifyProductName(productName);
  const m = name.match(/^(BUNDLES|CLOSURES|FRONTALS)\s*·\s*(STRAIGHT|WAVY|CURLY)$/);
  if (m) {
    const cat = m[1].toLowerCase();
    const tex = m[2].toLowerCase();
    if (cat === 'bundles' || cat === 'closures' || cat === 'frontals') {
      return `/shop/${cat}?texture=${tex}`;
    }
  }
  return '/home/shop';
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
  const copy = resolveAccountAlertCopy('stock_unit.notify_signup', { unitName, productName: unitName });
  const item: StoredNotification = {
    id,
    title: copy.title,
    message: copy.message,
    actionText: copy.actionText,
    actionRoute: stockNotifyProductActionRoute(unitName),
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
  const copy = resolveAccountAlertCopy('stock_unit.back_in_stock', { unitName, productName: unitName });
  const item: StoredNotification = {
    id,
    title: copy.title,
    message: copy.message,
    actionText: copy.actionText,
    actionRoute: stockNotifyProductActionRoute(unitName),
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
  if (!isProductSoldOutForStockNotify(unitName)) {
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
    if (isProductSoldOutForStockNotify(unit)) {
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
