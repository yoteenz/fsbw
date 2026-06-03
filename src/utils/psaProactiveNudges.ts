/**
 * Proactive PSA FAB nudges — unsigned forms, consults, stock, BAW drafts, order celebrations.
 */
import { getCurrentUserEmailFromStorage } from './perUserStorage';
import { buildConsultViewOfferOrdersHref } from './orderAccountAlerts';
import { orderNeedsClientAuthFormSignature } from './giftCardFirstPurchaseForm';
import type { ConsultOfferPersistedSnapshot } from './consultOfferFromQuote';
import { getWigUnitProductRoute } from './wigUnitProductRoutes';
import { normalizeCartLineProductName } from './cartCapSizeLineMargin';
import { detectPsaBawResumeTarget } from './psaBawDraft';
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
  | 'order_celebration';

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

function orderNum(order: Record<string, unknown>): string {
  return String(order.orderNumber ?? order.id ?? '').trim();
}

function orderId(order: Record<string, unknown>): string {
  return String(order.id ?? order.orderNumber ?? '').trim();
}

function hoursUntil(ms: number): number {
  return Math.max(0, Math.ceil((ms - Date.now()) / (60 * 60 * 1000)));
}

/** Highest-priority nudge for the PSA FAB (null when none). */
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

  const baw = detectPsaBawResumeTarget(pathname);
  if (baw) {
    nudges.push({
      id: `baw-${baw.unitId}`,
      kind: 'baw_draft',
      priority: 4,
      headline: baw.source === 'draft' ? 'YOUR BAW DRAFT IS SAVED' : 'FINISH YOUR CUSTOMIZATION',
      body: baw.unitLabel,
      actionPath: baw.buildPath,
      actionLabel: 'CONTINUE BAW',
      prefilledMessage: `Help me finish my ${baw.unitLabel} Build-a-Wig configuration where I left off.`,
    });
  }

  const celebration = detectPsaOrderCelebration(orders);
  if (celebration) {
    const match = orders.find((o) => orderNum(o) === celebration.orderNumber || orderId(o));
    const id = match ? orderId(match) : celebration.orderNumber;
    nudges.push({
      id: `celebrate-${celebration.kind}-${id}`,
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

  if (nudges.length === 0) {
    try {
      const raw = localStorage.getItem(`notifications_${email.trim().toLowerCase()}`);
      const items = raw ? (JSON.parse(raw) as { isRead?: boolean; title?: string; actionRoute?: string }[]) : [];
      const stockNote = Array.isArray(items)
        ? items.find(
            (n) =>
              n &&
              !n.isRead &&
              typeof n.title === 'string' &&
              (n.title.includes('BACK IN STOCK') || n.title.includes('LOW STOCK'))
          )
        : null;
      if (stockNote?.title) {
        nudges.push({
          id: `stock-alert-${stockNote.title}`,
          kind: 'stock_alert',
          priority: 6,
          headline: stockNote.title.includes('LOW STOCK') ? 'LOW STOCK ALERT' : 'BACK IN STOCK',
          body: 'ON YOUR WISHLIST',
          actionPath: stockNote.actionRoute || '/wishlist',
          actionLabel: 'SHOP NOW',
          prefilledMessage: 'Something on my wishlist changed stock. What should I do?',
        });
      }
    } catch {
      /* ignore */
    }
  }

  nudges.sort((a, b) => a.priority - b.priority);
  const top = nudges[0] ?? null;
  if (top?.celebrationMeta) {
    markOrderCelebrated(top.celebrationMeta.orderId, top.celebrationMeta.kind);
  }
  return top;
}
