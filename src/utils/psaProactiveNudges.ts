/**
 * Proactive PSA FAB nudges — page-context priority (BAW, wishlist, alerts, orders)
 * plus global alerts. Off-topic pages show the most recent nudge.
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
import { detectPsaBawResumeTarget, loadPsaBawDraft } from './psaBawDraft';
import {
  detectPsaOrderCelebration,
  markOrderCelebrated,
  type PsaOrderCelebrationKind,
} from './psaOrderCelebrations';

export type PsaProactiveNudgeKind =
  | 'unsigned_form'
  | 'expiring_consult'
  | 'stock_alert'
  | 'baw_draft'
  | 'order_celebration'
  | 'order_update'
  | 'profile_alert';

export type PsaNudgePageContext = 'baw' | 'wishlist' | 'alerts' | 'orders' | 'general';

export type PsaProactiveNudge = {
  id: string;
  kind: PsaProactiveNudgeKind;
  priority: number;
  headline: string;
  body?: string;
  actionPath: string;
  actionLabel: string;
  prefilledMessage?: string;
  /** Newest-first tie-break on general pages and within a page context. */
  recencyMs: number;
  pageContexts: PsaNudgePageContext[];
  /** For order celebrations — mark seen when nudge shown. */
  celebrationMeta?: { orderId: string; kind: PsaOrderCelebrationKind };
};

const STATIC_ACCOUNT_NOTIFICATION_PREFIX = 'acc_';

const ORDER_STATUS_NUDGE_STATUSES = ['SHIPPED', 'PREPARING', 'CONFIRMED'] as const;

/** Route → which nudge families get first pick on that page. */
export function resolvePsaNudgePageContext(pathname: string): PsaNudgePageContext {
  const path = pathname || '/';
  if (/^\/build-a-wig(\/|$)/i.test(path)) return 'baw';
  if (/^\/wishlist(\/|$)/i.test(path)) return 'wishlist';
  if (/^\/account\/alerts(\/|$)/i.test(path)) return 'alerts';
  if (/^\/(?:account\/)?orders(\/|$)/i.test(path)) return 'orders';
  return 'general';
}

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

function orderRecencyMs(order: Record<string, unknown>): number {
  if (typeof order.placedAt === 'number' && Number.isFinite(order.placedAt)) return order.placedAt;
  const u = order.updatedAt;
  if (u != null && u !== '') {
    const n = typeof u === 'number' ? u : Date.parse(String(u));
    if (!Number.isNaN(n)) return n;
  }
  return Date.now();
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

function nudgeMatchesPage(nudge: PsaProactiveNudge, page: PsaNudgePageContext): boolean {
  if (page === 'general') return false;
  return nudge.pageContexts.includes(page);
}

function compareWithinContext(a: PsaProactiveNudge, b: PsaProactiveNudge): number {
  if (a.priority !== b.priority) return a.priority - b.priority;
  return b.recencyMs - a.recencyMs;
}

function compareMostRecent(a: PsaProactiveNudge, b: PsaProactiveNudge): number {
  if (b.recencyMs !== a.recencyMs) return b.recencyMs - a.recencyMs;
  return a.priority - b.priority;
}

/** Pick page-relevant nudge first; otherwise the latest alert globally. */
export function pickContextualPsaProactiveNudge(
  nudges: PsaProactiveNudge[],
  pathname: string
): PsaProactiveNudge | null {
  if (nudges.length === 0) return null;
  const page = resolvePsaNudgePageContext(pathname);
  const pageNudges = nudges.filter((n) => nudgeMatchesPage(n, page));
  if (pageNudges.length > 0) {
    pageNudges.sort(compareWithinContext);
    return pageNudges[0];
  }
  const sorted = [...nudges].sort(compareMostRecent);
  return sorted[0] ?? null;
}

function nudgeFromStockNotification(n: StoredNotification): PsaProactiveNudge {
  const low = (n.title || '').toUpperCase().includes('LOW STOCK');
  const recencyMs = notificationSortAt(n) || Date.now();
  return {
    id: `notif-stock-${n.id}`,
    kind: 'stock_alert',
    priority: 6,
    headline: low ? 'LOW STOCK ALERT' : 'BACK IN STOCK',
    body: n.message?.trim() ? n.message.trim().slice(0, 48) : 'ON YOUR WISHLIST',
    actionPath: n.actionRoute || '/wishlist',
    actionLabel: n.actionText?.trim() || 'SHOP NOW',
    prefilledMessage: 'Something on my wishlist changed stock. What should I do?',
    recencyMs,
    pageContexts: ['wishlist'],
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
    recencyMs: notificationSortAt(n) || Date.now(),
    pageContexts: ['orders'],
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
    recencyMs: notificationSortAt(n) || Date.now(),
    pageContexts: ['alerts'],
  };
}

function collectNotificationNudges(email: string, nudges: PsaProactiveNudge[]): void {
  const unread = readStoredNotifications(email)
    .filter((n) => !n.isRead && !isStaticAccountNotification(n))
    .sort((a, b) => notificationSortAt(b) - notificationSortAt(a));

  for (const n of unread) {
    if (isStockNotification(n)) nudges.push(nudgeFromStockNotification(n));
    else if (isOrderNotification(n)) nudges.push(nudgeFromOrderNotification(n));
    else if (isProfileMessageNotification(n)) nudges.push(nudgeFromProfileNotification(n));
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
    nudges.push({
      id: `order-status-${id}-${status}`,
      kind: 'order_update',
      priority: 7,
      headline: status === 'SHIPPED' ? "SHE'S ON THE WAY" : 'ORDER UPDATE',
      body: num || status.replace(/_/g, ' '),
      actionPath: `/account/orders?orderId=${encodeURIComponent(id)}`,
      actionLabel: 'VIEW ORDER',
      prefilledMessage: num
        ? `My order ${num} status changed to ${status}. What's next?`
        : `My order status changed to ${status}. What's next?`,
      recencyMs: orderRecencyMs(order),
      pageContexts: ['orders'],
    });
    break;
  }
}

function collectBawDraftNudge(pathname: string, nudges: PsaProactiveNudge[]): void {
  if (resolvePsaNudgePageContext(pathname) !== 'baw') return;
  const baw = detectPsaBawResumeTarget(pathname);
  if (!baw) return;

  let recencyMs = Date.now();
  const draft = loadPsaBawDraft();
  if (draft?.savedAt) {
    const t = Date.parse(draft.savedAt);
    if (!Number.isNaN(t)) recencyMs = t;
  }

  nudges.push({
    id: `baw-${baw.unitId}`,
    kind: 'baw_draft',
    priority: 4,
    headline: baw.source === 'draft' ? 'YOUR BAW DRAFT IS SAVED' : 'FINISH YOUR CUSTOMIZATION',
    body: baw.unitLabel,
    actionPath: baw.buildPath,
    actionLabel: 'CONTINUE BAW',
    prefilledMessage: `Help me finish my ${baw.unitLabel} Build-a-Wig configuration where I left off.`,
    recencyMs,
    pageContexts: ['baw'],
  });
}

/** Highest-priority / page-context nudge for the PSA FAB (null when none). */
export function computePsaProactiveNudge(pathname = '/'): PsaProactiveNudge | null {
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
      recencyMs: placedAt,
      pageContexts: ['orders', 'general'],
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
      recencyMs: expires - 48 * 60 * 60 * 1000,
      pageContexts: ['orders', 'general'],
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
      recencyMs: Date.now(),
      pageContexts: ['general'],
    });
  }

  collectBawDraftNudge(pathname, nudges);

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
      recencyMs: match ? orderRecencyMs(match) : Date.now(),
      pageContexts: ['orders'],
      celebrationMeta: id ? { orderId: id, kind: celebration.kind } : undefined,
    });
  }

  collectNotificationNudges(email, nudges);
  collectOrderStatusNudges(orders, nudges);

  const top = pickContextualPsaProactiveNudge(nudges, pathname);
  if (top?.celebrationMeta) {
    markOrderCelebrated(top.celebrationMeta.orderId, top.celebrationMeta.kind);
  }
  return top;
}
