/**
 * Proactive PSA FAB nudges — unsigned forms, consults, stock, order updates, profile alerts.
 * Only surfaces actionable *new* alerts; no always-on session nudges (e.g. BAW drafts).
 */
import { getCurrentUserEmailFromStorage } from './perUserStorage';
import {
  buildConsultViewOfferOrdersHref,
  getNotificationsStorageKeyForUserEmail,
  type StoredNotification,
} from './orderAccountAlerts';
import { orderNeedsClientAuthFormSignature } from './giftCardFirstPurchaseForm';
import type { ConsultOfferPersistedSnapshot } from './consultOfferFromQuote';
import { getWigUnitProductRoute } from './wigUnitProductRoutes';
import { normalizeCartLineProductName } from './cartCapSizeLineMargin';
import {
  detectPsaOrderCelebration,
  markOrderCelebrated,
  type PsaOrderCelebrationKind,
} from './psaOrderCelebrations';

export type PsaProactiveNudgeKind =
  | 'unsigned_form'
  | 'expiring_consult'
  | 'stock_alert'
  | 'order_celebration'
  | 'order_update'
  | 'profile_alert';

export type PsaProactiveNudge = {
  id: string;
  kind: PsaProactiveNudgeKind;
  priority: number;
  headline: string;
  body?: string;
  actionPath: string;
  actionLabel: string;
  prefilledMessage?: string;
  /** For order celebrations — mark seen when nudge shown. */
  celebrationMeta?: { orderId: string; kind: PsaOrderCelebrationKind };
};

const STATIC_ACCOUNT_NOTIFICATION_PREFIX = 'acc_';

const ORDER_STATUS_NUDGE_STATUSES = ['SHIPPED', 'PREPARING', 'CONFIRMED'] as const;

function readUserOrders(email: string): Record<string, unknown>[] {
  try {
    const raw = localStorage.getItem(`userOrders_${email.trim().toLowerCase()}`);
    if (!raw) return [];
    const data = JSON.parse(raw) as { activeOrders?: unknown[]; pastOrders?: unknown[] };
    const active = Array.isArray(data.activeOrders) ? data.activeOrders : [];
    return active.filter((o) => o && typeof o === 'object') as Record<string, unknown>[];
  } catch {
    return [];
  }
}

function readCartItems(): Record<string, unknown>[] {
  try {
    const raw = localStorage.getItem('cartItems');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

function readStoredNotifications(email: string): StoredNotification[] {
  try {
    const key = getNotificationsStorageKeyForUserEmail(email);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const items = JSON.parse(raw) as StoredNotification[];
    if (!Array.isArray(items)) return [];
    return items.filter((n) => n && typeof n === 'object' && typeof n.id === 'string');
  } catch {
    return [];
  }
}

function orderNum(order: Record<string, unknown>): string {
  return String(order.orderNumber ?? order.id ?? '').trim();
}

function orderId(order: Record<string, unknown>): string {
  return String(order.id ?? order.orderNumber ?? '').trim();
}

function hoursUntil(ms: number): number {
  return Math.max(0, Math.ceil((ms - Date.now()) / (60 * 60 * 1000)));
}

function isStaticAccountNotification(n: StoredNotification): boolean {
  return n.id.startsWith(STATIC_ACCOUNT_NOTIFICATION_PREFIX);
}

function isStockNotification(n: StoredNotification): boolean {
  const title = (n.title || '').toUpperCase();
  return title.includes('BACK IN STOCK') || title.includes('LOW STOCK');
}

function isOrderNotification(n: StoredNotification): boolean {
  const title = (n.title || '').toUpperCase();
  if (n.id.startsWith('order_received_')) return true;
  if (n.id.startsWith('order_track_')) return true;
  if (n.id.startsWith('consult_offer_sent_')) return true;
  if (title.includes('ORDER TRACKING')) return true;
  if (title.includes('RECEIVED YOUR ORDER')) return true;
  if (title.includes('YOUR ORDER IS READY')) return true;
  if (title.includes("WE'VE RECEIVED YOUR ORDER")) return true;
  return false;
}

function isProfileMessageNotification(n: StoredNotification): boolean {
  if (n.id.startsWith('admin_')) return true;
  if (isStockNotification(n) || isOrderNotification(n)) return false;
  return true;
}

function notificationSortAt(n: StoredNotification): number {
  if (typeof n.sortAt === 'number' && Number.isFinite(n.sortAt)) return n.sortAt;
  return 0;
}

function nudgeFromStockNotification(n: StoredNotification): PsaProactiveNudge {
  const low = (n.title || '').toUpperCase().includes('LOW STOCK');
  return {
    id: `notif-stock-${n.id}`,
    kind: 'stock_alert',
    priority: 6,
    headline: low ? 'LOW STOCK ALERT' : 'BACK IN STOCK',
    body: n.message?.trim() ? n.message.trim().slice(0, 48) : 'ON YOUR WISHLIST',
    actionPath: n.actionRoute || '/wishlist',
    actionLabel: n.actionText?.trim() || 'SHOP NOW',
    prefilledMessage: 'Something on my wishlist changed stock. What should I do?',
  };
}

function nudgeFromOrderNotification(n: StoredNotification): PsaProactiveNudge {
  const title = (n.title || '').trim().toUpperCase();
  let headline = 'ORDER UPDATE';
  if (title.includes('TRACKING')) headline = 'ORDER TRACKING UPDATE';
  else if (title.includes('READY')) headline = 'YOUR ORDER IS READY';
  else if (title.includes('RECEIVED')) headline = 'ORDER CONFIRMED';
  else if (title) headline = title.length > 28 ? `${title.slice(0, 28)}…` : title;

  return {
    id: `notif-order-${n.id}`,
    kind: 'order_update',
    priority: 7,
    headline,
    body: n.message?.trim() ? n.message.trim().slice(0, 48) : undefined,
    actionPath: n.actionRoute || '/account/orders',
    actionLabel: n.actionText?.trim() || 'VIEW ORDER',
    prefilledMessage: n.message?.trim()
      ? `Tell me about this order update: ${n.message.trim()}`
      : 'I have a new order update. What should I know?',
  };
}

function nudgeFromProfileNotification(n: StoredNotification): PsaProactiveNudge {
  const title = (n.title || '').trim();
  return {
    id: `notif-profile-${n.id}`,
    kind: 'profile_alert',
    priority: 8,
    headline: 'NEW PROFILE ALERT',
    body: title ? (title.length > 36 ? `${title.slice(0, 36)}…` : title) : 'VIEW YOUR ALERTS',
    actionPath: n.actionRoute || '/account/alerts',
    actionLabel: n.actionText?.trim() || 'VIEW ALERTS',
    prefilledMessage: title
      ? `I have a new alert: ${title}. What should I do?`
      : 'I have a new profile alert. What should I do?',
  };
}

function collectNotificationNudges(email: string, nudges: PsaProactiveNudge[]): void {
  const unread = readStoredNotifications(email)
    .filter((n) => !n.isRead && !isStaticAccountNotification(n))
    .sort((a, b) => notificationSortAt(b) - notificationSortAt(a));

  for (const n of unread) {
    if (isStockNotification(n)) {
      nudges.push(nudgeFromStockNotification(n));
      break;
    }
  }

  for (const n of unread) {
    if (isOrderNotification(n)) {
      nudges.push(nudgeFromOrderNotification(n));
      break;
    }
  }

  for (const n of unread) {
    if (isProfileMessageNotification(n)) {
      nudges.push(nudgeFromProfileNotification(n));
      break;
    }
  }
}

function collectOrderStatusNudges(orders: Record<string, unknown>[], nudges: PsaProactiveNudge[]): void {
  for (const order of orders) {
    const status = String(order.status || '').toUpperCase();
    if (!ORDER_STATUS_NUDGE_STATUSES.includes(status as (typeof ORDER_STATUS_NUDGE_STATUSES)[number])) {
      continue;
    }
    const id = orderId(order);
    if (!id) continue;
    const seenKey = `orderStatusSeen_${id}_${status}`;
    if (localStorage.getItem(seenKey)) continue;

    const num = orderNum(order);
    const nudgeId = `order-status-${id}-${status}`;
    nudges.push({
      id: nudgeId,
      kind: 'order_update',
      priority: 7,
      headline: status === 'SHIPPED' ? "SHE'S ON THE WAY" : 'ORDER UPDATE',
      body: num || status.replace(/_/g, ' '),
      actionPath: `/account/orders?orderId=${encodeURIComponent(id)}`,
      actionLabel: 'VIEW ORDER',
      prefilledMessage: num
        ? `My order ${num} status changed to ${status}. What's next?`
        : `My order status changed to ${status}. What's next?`,
    });
    break;
  }
}

/** Highest-priority nudge for the PSA FAB (null when none). */
export function computePsaProactiveNudge(_pathname = '/'): PsaProactiveNudge | null {
  const email = getCurrentUserEmailFromStorage();
  if (!email) return null;

  const nudges: PsaProactiveNudge[] = [];
  const orders = readUserOrders(email);

  for (const order of orders) {
    if (String(order.status || '').toUpperCase() !== 'PLACED') continue;
    if (order.orderFormSigned === true) continue;
    if (!orderNeedsClientAuthFormSignature(order)) continue;
    const placedAt = typeof order.placedAt === 'number' ? order.placedAt : Date.now();
    const hoursLeft = hoursUntil(placedAt + 24 * 60 * 60 * 1000);
    const num = orderNum(order);
    nudges.push({
      id: `unsigned-${order.id ?? num}`,
      kind: 'unsigned_form',
      priority: 1,
      headline: 'SIGN YOUR ORDER FORM',
      body: num ? `${num} — ${hoursLeft}H LEFT` : `${hoursLeft}H LEFT`,
      actionPath: '/tools/order-form',
      actionLabel: 'SIGN FORM',
      prefilledMessage: num
        ? `Help me sign the order authorization form for ${num} before it expires.`
        : 'Help me sign my order authorization form before it expires.',
    });
    break;
  }

  for (const order of orders) {
    const snap = order.consultOfferSnapshot as ConsultOfferPersistedSnapshot | undefined;
    if (!snap?.expiresAt) continue;
    const expires = new Date(snap.expiresAt).getTime();
    if (!Number.isFinite(expires) || expires <= Date.now()) continue;
    const hoursLeft = hoursUntil(expires);
    if (hoursLeft > 48) continue;
    const num = orderNum(order);
    nudges.push({
      id: `consult-${order.id ?? num}`,
      kind: 'expiring_consult',
      priority: 2,
      headline: 'CONSULT OFFER EXPIRING',
      body: num ? `${num} — ${hoursLeft}H LEFT` : `${hoursLeft}H LEFT`,
      actionPath: buildConsultViewOfferOrdersHref(num, String(order.id ?? '')),
      actionLabel: 'VIEW OFFER',
      prefilledMessage: num
        ? `Walk me through my consult offer on ${num} before it expires.`
        : 'Walk me through my consult offer before it expires.',
    });
    break;
  }

  const oos = readCartItems().find((i) => String(i.stockStatus ?? '') === 'out_of_stock');
  if (oos) {
    const name = normalizeCartLineProductName({
      name: String(oos.name ?? ''),
      productName: String(oos.name ?? ''),
    });
    nudges.push({
      id: `stock-cart-${name}`,
      kind: 'stock_alert',
      priority: 3,
      headline: 'ITEM OUT OF STOCK',
      body: name ? `${name} IN YOUR BAG` : 'IN YOUR BAG',
      actionPath: getWigUnitProductRoute(name) ?? '/home/shop',
      actionLabel: 'NOTIFY ME',
      prefilledMessage: name
        ? `${name} in my bag is out of stock. What are my options?`
        : 'Something in my bag is out of stock. What are my options?',
    });
  }

  const celebration = detectPsaOrderCelebration(orders);
  if (celebration) {
    const match = orders.find((o) => orderNum(o) === celebration.orderNumber || orderId(o));
    const id = match ? orderId(match) : celebration.orderNumber;
    const celebrationId = `celebrate-${celebration.kind}-${id}`;
    nudges.push({
      id: celebrationId,
      kind: 'order_celebration',
      priority: 5,
      headline: celebration.headline,
      body: celebration.body,
      actionPath: '/orders',
      actionLabel: 'VIEW ORDER',
      prefilledMessage: celebration.prefilledMessage,
      celebrationMeta: id ? { orderId: id, kind: celebration.kind } : undefined,
    });
  }

  collectNotificationNudges(email, nudges);
  collectOrderStatusNudges(orders, nudges);

  nudges.sort((a, b) => a.priority - b.priority);
  const top = nudges[0] ?? null;
  if (top?.celebrationMeta) {
    markOrderCelebrated(top.celebrationMeta.orderId, top.celebrationMeta.kind);
  }
  return top;
}
