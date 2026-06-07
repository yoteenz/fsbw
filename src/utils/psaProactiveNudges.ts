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
import {
  buildPsaSlayJournalSnapshot,
  markHallMilestoneCelebrated,
  type HallOfSlayMilestoneId,
} from './psaSlayJournal';
import { resolveNudgeCopy } from './copyDebugResolve';

export type PsaProactiveNudgeKind =
  | 'unsigned_form'
  | 'expiring_consult'
  | 'stock_alert'
  | 'baw_draft'
  | 'order_celebration'
  | 'order_update'
  | 'profile_alert'
  | 'member_milestone';

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

const HALL_MILESTONE_HEADLINE: Record<HallOfSlayMilestoneId, string> = {
  first_order: 'YOUR SLAY JOURNEY STARTED',
  first_custom_unit: 'FIRST CUSTOM UNIT',
  first_consult: 'FIRST CONSULT LOCKED IN',
  fifth_order: 'FIFTH ORDER MILESTONE',
  one_year_premium: 'ONE YEAR PREMIUM',
  black_status: 'BLACK STATUS UNLOCKED',
};

const HALL_MILESTONE_BODY: Record<HallOfSlayMilestoneId, string> = {
  first_order: 'THIS IS A MOMENT WORTH REMEMBERING.',
  first_custom_unit: 'YOUR FIRST FULLY CUSTOMIZED UNIT.',
  first_consult: 'YOU TOOK THE CONSULT PATH.',
  fifth_order: 'A TRUE ROTATION SLAYER.',
  one_year_premium: 'ONE YEAR IN THE PREMIUM CIRCLE.',
  black_status: 'TOP TIER ACCESS AND CURATOR ENERGY.',
};

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
  const variantId = low ? 'stock_alert.notif.low_stock' : 'stock_alert.notif.back_in_stock';
  const hasBody = Boolean(n.message?.trim());
  const resolvedVariant = !low && !hasBody ? 'stock_alert.notif.back_in_stock.fallback_body' : variantId;
  const copy = resolveNudgeCopy(resolvedVariant, {
    message: n.message?.trim() ?? '',
  });
  return {
    id: `notif-stock-${n.id}`,
    kind: 'stock_alert',
    priority: 6,
    headline: copy.headline,
    body: hasBody && !low ? n.message!.trim().slice(0, 48) : copy.body,
    actionPath: n.actionRoute || '/wishlist',
    actionLabel: n.actionText?.trim() || copy.actionLabel || 'SHOP NOW',
    prefilledMessage: copy.prefilledMessage,
    recencyMs,
    pageContexts: ['wishlist'],
  };
}

function nudgeFromOrderNotification(n: StoredNotification): PsaProactiveNudge {
  const title = (n.title || '').trim().toUpperCase();
  let variantId = 'order_update.notif.generic';
  if (title.includes('TRACKING')) variantId = 'order_update.notif.tracking';
  else if (title.includes('READY')) variantId = 'order_update.notif.ready';
  else if (title.includes('RECEIVED')) variantId = 'order_update.notif.received';

  const msg = n.message?.trim() ?? '';
  const copy = resolveNudgeCopy(variantId, {
    notificationMessage: msg,
    stageLabel: msg.includes(':') ? msg.split(':')[0]?.trim() ?? '' : '',
    trackingNote: msg.includes(':') ? msg.split(':').slice(1).join(':').trim() : msg,
  });

  let headline = copy.headline;
  if (variantId === 'order_update.notif.generic' && title && !title.includes('TRACKING') && !title.includes('READY') && !title.includes('RECEIVED')) {
    headline = title.length > 28 ? `${title.slice(0, 28)}…` : title;
  }

  return {
    id: `notif-order-${n.id}`,
    kind: 'order_update',
    priority: 7,
    headline,
    body: msg ? msg.slice(0, 48) : copy.body,
    actionPath: n.actionRoute || '/account/orders',
    actionLabel: n.actionText?.trim() || copy.actionLabel || 'VIEW ORDER',
    prefilledMessage: msg
      ? interpolatePrefilledFromTemplate(copy.prefilledMessage, msg, variantId)
      : copy.prefilledMessage,
    recencyMs: notificationSortAt(n) || Date.now(),
    pageContexts: ['orders'],
  };
}

function interpolatePrefilledFromTemplate(template: string | undefined, message: string, variantId: string): string {
  if (!template) {
    return message ? `Tell me about this order update: ${message}` : 'I have a new order update. What should I know?';
  }
  if (variantId === 'order_update.notif.tracking' || variantId === 'order_update.notif.ready' || variantId === 'order_update.notif.received') {
    return template.replace(/\{notificationMessage\}/g, message).replace(/\{message\}/g, message);
  }
  return template;
}

function nudgeFromProfileNotification(n: StoredNotification): PsaProactiveNudge {
  const title = (n.title || '').trim();
  const variantId = title ? 'profile_alert.with_title' : 'profile_alert.fallback';
  const displayTitle = title ? (title.length > 36 ? `${title.slice(0, 36)}…` : title) : '';
  const copy = resolveNudgeCopy(variantId, { title: displayTitle, adminAlertTitle: displayTitle });
  return {
    id: `notif-profile-${n.id}`,
    kind: 'profile_alert',
    priority: 8,
    headline: copy.headline,
    body: title ? displayTitle : copy.body,
    actionPath: n.actionRoute || '/account/alerts',
    actionLabel: n.actionText?.trim() || copy.actionLabel || 'VIEW ALERTS',
    prefilledMessage: title
      ? (copy.prefilledMessage?.replace(/\{title\}/g, title).replace(/\{adminAlertTitle\}/g, title) ??
          `I have a new alert: ${title}. What should I do?`)
      : copy.prefilledMessage,
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
    const statusVariant =
      status === 'SHIPPED'
        ? 'order_update.status.shipped'
        : status === 'PREPARING'
          ? 'order_update.status.preparing'
          : status === 'CONFIRMED'
            ? 'order_update.status.confirmed'
            : 'order_update.status.no_order';
    const variantId = num ? statusVariant : 'order_update.status.no_order';
    const copy = resolveNudgeCopy(variantId, {
      orderRef: num,
      orderNumber: num.replace(/^ORDER\s*#?\s*/i, '').trim() || num,
      num,
      status: status.replace(/_/g, ' '),
    });
    nudges.push({
      id: `order-status-${id}-${status}`,
      kind: 'order_update',
      priority: 7,
      headline: copy.headline,
      body: num || copy.body || status.replace(/_/g, ' '),
      actionPath: `/account/orders?orderId=${encodeURIComponent(id)}`,
      actionLabel: copy.actionLabel || 'VIEW ORDER',
      prefilledMessage: copy.prefilledMessage,
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

  const variantId = baw.source === 'draft' ? 'baw_draft.saved' : 'baw_draft.session';
  const copy = resolveNudgeCopy(variantId, { unitLabel: baw.unitLabel, productName: baw.unitLabel });
  nudges.push({
    id: `baw-${baw.unitId}`,
    kind: 'baw_draft',
    priority: 4,
    headline: copy.headline,
    body: baw.unitLabel,
    actionPath: baw.buildPath,
    actionLabel: copy.actionLabel || 'CONTINUE BAW',
    prefilledMessage: copy.prefilledMessage,
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
    const variantId = num ? 'unsigned_form.with_order' : 'unsigned_form.no_order';
    const copy = resolveNudgeCopy(variantId, { orderRef: num, orderNumber: num, hoursLeft: String(hoursLeft) });
    nudges.push({
      id: `unsigned-${order.id ?? num}`,
      kind: 'unsigned_form',
      priority: 1,
      headline: copy.headline,
      body: num ? `${num} — ${hoursLeft}H LEFT` : `${hoursLeft}H LEFT`,
      actionPath: '/tools/order-form',
      actionLabel: copy.actionLabel || 'SIGN FORM',
      prefilledMessage: copy.prefilledMessage,
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
    const variantId = num ? 'expiring_consult.with_order' : 'expiring_consult.no_order';
    const copy = resolveNudgeCopy(variantId, { orderRef: num, orderNumber: num, hoursLeft: String(hoursLeft) });
    nudges.push({
      id: `consult-${order.id ?? num}`,
      kind: 'expiring_consult',
      priority: 2,
      headline: copy.headline,
      body: num ? `${num} — ${hoursLeft}H LEFT` : `${hoursLeft}H LEFT`,
      actionPath: buildConsultViewOfferOrdersHref(num, String(order.id ?? '')),
      actionLabel: copy.actionLabel || 'VIEW OFFER',
      prefilledMessage: copy.prefilledMessage,
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
    const variantId = name ? 'stock_alert.cart.with_product' : 'stock_alert.cart.fallback';
    const copy = resolveNudgeCopy(variantId, { productName: name });
    nudges.push({
      id: `stock-cart-${name}`,
      kind: 'stock_alert',
      priority: 3,
      headline: copy.headline,
      body: name ? `${name} IN YOUR BAG` : copy.body || 'IN YOUR BAG',
      actionPath: getWigUnitProductRoute(name) ?? '/home/shop',
      actionLabel: copy.actionLabel || 'NOTIFY ME',
      prefilledMessage: copy.prefilledMessage,
      recencyMs: Date.now(),
      pageContexts: ['general'],
    });
  }

  collectBawDraftNudge(pathname, nudges);

  const journal = buildPsaSlayJournalSnapshot();
  if (journal.pendingMilestone) {
    const id = journal.pendingMilestone;
    const variantId = `member_milestone.${id}`;
    const copy = resolveNudgeCopy(variantId, {
      milestoneTitle: HALL_MILESTONE_HEADLINE[id],
    });
    nudges.push({
      id: `milestone-${id}`,
      kind: 'member_milestone',
      priority: 6,
      headline: copy.headline || HALL_MILESTONE_HEADLINE[id],
      body: copy.body || HALL_MILESTONE_BODY[id],
      actionPath: '/account',
      actionLabel: copy.actionLabel || 'VIEW JOURNAL',
      prefilledMessage:
        copy.prefilledMessage ||
        `Celebrate my ${HALL_MILESTONE_HEADLINE[id].toLowerCase()} milestone with me and tell me what is smart to do next.`,
      recencyMs: Date.now(),
      pageContexts: ['general', 'orders'],
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
      actionLabel: celebration.actionLabel || 'VIEW ORDER',
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
  if (top?.kind === 'member_milestone') {
    const id = top.id.replace(/^milestone-/, '') as HallOfSlayMilestoneId;
    if (HALL_MILESTONE_HEADLINE[id]) markHallMilestoneCelebrated(id);
  }
  return top;
}
