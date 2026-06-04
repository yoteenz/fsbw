import { resolveAccountAlertCopy } from './copyDebugResolve';

type AlertUser = {
  email?: string;
  membershipType?: string;
  subscriptionTier?: string;
};

export type AlertOrder = {
  id?: string;
  orderNumber?: string;
  bookingFlowType?: string;
  status?: string;
  placedAt?: number;
  createdAt?: string | number;
  updatedAt?: string | number;
};

export type StoredNotification = {
  id: string;
  title: string;
  message: string;
  actionText?: string;
  actionRoute?: string;
  date: string;
  /** Epoch ms when known (e.g. order placed); used to sort newest-first on Alerts. */
  sortAt?: number;
  isRead: boolean;
  icon: string;
  /** When set, Account → Alerts uses consult-offer row styling (black header / gray body / red link). */
  variant?: 'consult_offer_ready';
};

const STANDARD_NOTIFICATION_ICON = 'f';

function notificationsKey(email: string): string {
  return `notifications_${email.trim().toLowerCase()}`;
}

/** Single source for `localStorage` key — must match alerts page + account badge merge (always lowercase email). */
export function getNotificationsStorageKeyForUserEmail(email: string | undefined | null): string {
  const e = String(email || '').trim().toLowerCase();
  return e ? `notifications_${e}` : 'notifications';
}

/**
 * Merge legacy `notifications_${rawEmail}` into canonical lowercase key (checkout uses lowercase).
 * Run before reading notifications for the signed-in user.
 */
export function migrateNotificationsLocalStorageKeys(userEmail: string | undefined | null): void {
  if (typeof window === 'undefined') return;
  const raw = String(userEmail || '').trim();
  if (!raw) return;
  const canon = getNotificationsStorageKeyForUserEmail(raw);
  const legacy = `notifications_${raw}`;
  if (legacy === canon) return;
  try {
    const legacyData = localStorage.getItem(legacy);
    if (!legacyData) return;
    const existingRaw = localStorage.getItem(canon);
    const a = JSON.parse(legacyData) as unknown;
    const b = existingRaw ? (JSON.parse(existingRaw) as unknown) : [];
    if (!Array.isArray(a) || !Array.isArray(b)) return;
    const byId = new Map<string, Record<string, unknown>>();
    for (const n of b) {
      if (n && typeof n === 'object' && typeof (n as { id?: string }).id === 'string') {
        byId.set((n as { id: string }).id, n as Record<string, unknown>);
      }
    }
    for (const n of a) {
      if (n && typeof n === 'object' && typeof (n as { id?: string }).id === 'string') {
        byId.set((n as { id: string }).id, n as Record<string, unknown>);
      }
    }
    localStorage.setItem(canon, JSON.stringify(Array.from(byId.values())));
    localStorage.removeItem(legacy);
  } catch {
    /* ignore */
  }
}

function todayMdy(): string {
  const d = new Date();
  return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
}

function isPremiumLike(user: AlertUser | null | undefined): boolean {
  const membership = String(user?.membershipType || '').trim().toUpperCase();
  return membership === 'PREMIUM' || Boolean(user?.subscriptionTier);
}

function alertRouteForOrder(user: AlertUser | null | undefined, order: AlertOrder): string {
  const orderId = String(order.id || '').trim();
  const isAppointmentOrConsult =
    String(order.bookingFlowType || '').trim().toLowerCase() === 'appointment' ||
    String(order.bookingFlowType || '').trim().toLowerCase() === 'consult';

  if ((isPremiumLike(user) || isAppointmentOrConsult) && orderId) {
    return `/account/concierge?orderId=${encodeURIComponent(orderId)}`;
  }
  if (orderId) {
    return `/account/orders?orderId=${encodeURIComponent(orderId)}`;
  }
  return '/account/orders';
}

function displayOrderNumber(order: AlertOrder): string {
  const raw = String(order.orderNumber || order.id || '').trim();
  const stripped = raw.replace(/^ORDER\s*#?\s*/i, '').replace(/^#/, '').trim();
  return stripped || '—';
}

/** Digits for **orderNumber=** deep link (e.g. **332** from `ORDER #332`). */
export function consultAlertOrderNumberTokenForUrl(orderNumberDisplay: string): string {
  const s = String(orderNumberDisplay || '')
    .trim()
    .toUpperCase()
    .replace(/^ORDER\s*#?\s*/i, '')
    .replace(/^#/, '')
    .trim();
  const m = s.match(/\d+/);
  return m ? m[0] : '';
}

export function buildConsultViewOfferOrdersHref(orderNumberDisplay: string, matchedOrderId?: string): string {
  const id = String(matchedOrderId || '').trim();
  if (id) return `/account/orders?orderId=${encodeURIComponent(id)}&consultOffer=1`;
  const num = consultAlertOrderNumberTokenForUrl(orderNumberDisplay);
  if (num) return `/account/orders?orderNumber=${encodeURIComponent(num)}&consultOffer=1`;
  return '/account/orders?consultOffer=1';
}

function orderTimestampMs(order: AlertOrder): number | undefined {
  if (typeof order.placedAt === 'number' && !Number.isNaN(order.placedAt)) return order.placedAt;
  const u = order.updatedAt;
  if (u != null && u !== '') {
    const n = typeof u === 'number' ? u : Date.parse(String(u));
    if (!Number.isNaN(n)) return n;
  }
  const c = order.createdAt;
  if (c != null && c !== '') {
    const n = typeof c === 'number' ? c : Date.parse(String(c));
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

export function buildOrderReceivedAccountAlert(
  user: AlertUser | null | undefined,
  order: AlertOrder
): StoredNotification | null {
  const email = String(user?.email || '').trim().toLowerCase();
  const orderId = String(order.id || order.orderNumber || '').trim();
  if (!email || !orderId) return null;

  const orderNum = displayOrderNumber(order);
  const sortAt = orderTimestampMs(order);
  const copy = resolveAccountAlertCopy('order_received.standard', { orderNumber: orderNum });
  return {
    id: `order_received_${orderId}`,
    title: copy.title,
    message: copy.message,
    actionText: copy.actionText,
    actionRoute: alertRouteForOrder(user, order),
    date: todayMdy(),
    ...(sortAt != null ? { sortAt } : {}),
    isRead: false,
    icon: STANDARD_NOTIFICATION_ICON,
  };
}

/** After admin sends a consult offer: client Alerts row (local) mirroring order-complete style. */
export function appendConsultOfferCompleteAccountAlert(
  clientEmail: string,
  orderNumberDisplay: string,
  quoteId: string,
  options?: { matchedOrderId?: string }
): void {
  const email = String(clientEmail || '').trim().toLowerCase();
  if (!email || typeof window === 'undefined') return;
  const qid = String(quoteId || '').trim();
  const id = qid ? `consult_offer_sent_${qid}` : `consult_offer_sent_${Date.now()}`;
  const orderNum = orderNumberDisplay.replace(/^ORDER\s*#?\s*/i, '').replace(/^#/, '').trim() || '—';
  const now = Date.now();
  const copy = resolveAccountAlertCopy('consult_offer.sent_local', { orderNumber: orderNum });
  const item: StoredNotification = {
    id,
    title: copy.title,
    message: copy.message,
    actionText: copy.actionText,
    actionRoute: buildConsultViewOfferOrdersHref(orderNumberDisplay, options?.matchedOrderId),
    date: todayMdy(),
    sortAt: now,
    isRead: false,
    icon: STANDARD_NOTIFICATION_ICON,
    variant: 'consult_offer_ready',
  };
  try {
    const key = notificationsKey(email);
    const raw = localStorage.getItem(key);
    const existing: StoredNotification[] = raw && Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    const merged = [item, ...existing.filter((n) => n.id !== id)];
    localStorage.setItem(key, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
    window.dispatchEvent(new Event('notificationsUpdated'));
    window.dispatchEvent(new Event('storage'));
  } catch {
    /* ignore */
  }
}

export function appendOrderReceivedAccountAlert(
  user: AlertUser | null | undefined,
  order: AlertOrder
): void {
  const email = String(user?.email || '').trim().toLowerCase();
  if (!email) return;
  const next = buildOrderReceivedAccountAlert(user, order);
  if (!next) return;

  try {
    const key = notificationsKey(email);
    const raw = localStorage.getItem(key);
    const existing: StoredNotification[] = raw && Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    const merged = [next, ...existing.filter((n) => n.id !== next.id)];
    localStorage.setItem(key, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
    window.dispatchEvent(new Event('notificationsUpdated'));
    window.dispatchEvent(new Event('storage'));
  } catch {
    /* ignore */
  }
}

export function getOrderReceivedAccountAlerts(
  user: AlertUser | null | undefined
): StoredNotification[] {
  const email = String(user?.email || '').trim().toLowerCase();
  if (!email || typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`userOrders_${email}`);
    const data = raw ? JSON.parse(raw) : { activeOrders: [], pastOrders: [] };
    const activeOrders: AlertOrder[] = Array.isArray(data?.activeOrders) ? data.activeOrders : [];
    return activeOrders
      .filter((order) => {
        const status = String(order?.status || '').trim().toUpperCase();
        return (
          status !== 'DELIVERED' &&
          status !== 'COMPLETE' &&
          status !== 'CANCELED' &&
          status !== 'CANCELLED'
        );
      })
      .map((order) => buildOrderReceivedAccountAlert(user, order))
      .filter((notification): notification is StoredNotification => Boolean(notification));
  } catch {
    return [];
  }
}
