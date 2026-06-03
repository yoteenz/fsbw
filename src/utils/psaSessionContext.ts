/**
 * Client session snapshot sent with each PSA chat message — page, tier, cart, orders.
 */
import {
  getEffectiveSubscriptionTier,
  getEffectiveTierName,
} from './adminAuth';
import { getCurrentUserEmailFromStorage, getCurrentUserFirstNameFromStorage } from './perUserStorage';
import { formatPsaMemberFirstName } from '../constants/psaConfig';
import { orderNeedsClientAuthFormSignature } from './giftCardFirstPurchaseForm';
import type { ConsultOfferPersistedSnapshot } from './consultOfferFromQuote';
import { detectPsaBawResumeTarget } from './psaBawDraft';
import { computePsaSlayReadiness } from './psaSlayReadiness';

export type PsaSessionMode =
  | 'talk_me_out_of_it'
  | 'event_ready'
  | 'what_would_you_pick';

export type PsaClientSessionContext = {
  pathname: string;
  firstName?: string | null;
  tierLabel?: string | null;
  subscriptionTier?: string | null;
  cart?: {
    itemCount: number;
    unitNames: string[];
    hasOutOfStock: boolean;
  };
  orders?: {
    unsignedFormCount: number;
    unsignedFormOrderNumbers: string[];
    expiringConsultCount: number;
    expiringConsultOrderNumbers: string[];
  };
  unreadStockAlertCount?: number;
  slayReadiness?: {
    percent: number;
    checklist: { label: string; done: boolean }[];
  };
  bawDraft?: {
    unitLabel: string;
    buildPath: string;
    source: 'draft' | 'session';
  };
  mode?: PsaSessionMode;
};

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

function readUserOrders(email: string): Record<string, unknown>[] {
  try {
    const raw = localStorage.getItem(`userOrders_${email.trim().toLowerCase()}`);
    if (!raw) return [];
    const data = JSON.parse(raw) as { activeOrders?: unknown[]; pastOrders?: unknown[] };
    const active = Array.isArray(data.activeOrders) ? data.activeOrders : [];
    const past = Array.isArray(data.pastOrders) ? data.pastOrders : [];
    return [...active, ...past].filter((o) => o && typeof o === 'object') as Record<string, unknown>[];
  } catch {
    return [];
  }
}

function isUnsignedFormOrder(order: Record<string, unknown>): boolean {
  if (String(order.status || '').toUpperCase() !== 'PLACED') return false;
  if (order.orderFormSigned === true) return false;
  return orderNeedsClientAuthFormSignature(order);
}

function isExpiringConsultOffer(order: Record<string, unknown>, withinHours = 48): boolean {
  const snap = order.consultOfferSnapshot as ConsultOfferPersistedSnapshot | undefined;
  if (!snap?.expiresAt) return false;
  const expires = new Date(snap.expiresAt).getTime();
  if (!Number.isFinite(expires) || expires <= Date.now()) return false;
  return expires - Date.now() <= withinHours * 60 * 60 * 1000;
}

function orderNumberDisplay(order: Record<string, unknown>): string {
  return String(order.orderNumber ?? order.id ?? '').trim();
}

function countUnreadStockAlerts(email: string): number {
  try {
    const raw = localStorage.getItem(`notifications_${email.trim().toLowerCase()}`);
    if (!raw) return 0;
    const items = JSON.parse(raw) as { isRead?: boolean; title?: string }[];
    if (!Array.isArray(items)) return 0;
    return items.filter(
      (n) =>
        n &&
        !n.isRead &&
        typeof n.title === 'string' &&
        (n.title.includes('BACK IN STOCK') || n.title.includes('LOW STOCK'))
    ).length;
  } catch {
    return 0;
  }
}

function inferModeFromMessage(message: string): PsaSessionMode | undefined {
  const t = message.toUpperCase();
  if (
    t.includes('SHOULD I REALLY BUY') ||
    t.includes('TALK ME OUT OF IT') ||
    t.includes('SHOULD I UPGRADE') ||
    t.includes('DO I NEED THIS')
  ) {
    return 'talk_me_out_of_it';
  }
  if (t.includes('EVENT READY') || t.includes('WEDDING') || t.includes('GET ME READY FOR')) {
    return 'event_ready';
  }
  if (t.includes('WHAT WOULD YOU PICK') || t.includes('WHAT WOULD YOU CHOOSE')) {
    return 'what_would_you_pick';
  }
  return undefined;
}

/** Build a compact session snapshot for PSA (no PII beyond order numbers already in app). */
export function buildPsaClientSessionContext(
  pathname: string,
  pendingMessage?: string
): PsaClientSessionContext {
  const ctx: PsaClientSessionContext = { pathname };

  const storedFirstName = getCurrentUserFirstNameFromStorage();
  if (storedFirstName) {
    ctx.firstName = formatPsaMemberFirstName(storedFirstName);
  }

  try {
    const rawUser = localStorage.getItem('currentUser');
    const user = rawUser ? (JSON.parse(rawUser) as Record<string, unknown>) : null;
    ctx.tierLabel = getEffectiveTierName(user as Parameters<typeof getEffectiveTierName>[0]);
    ctx.subscriptionTier = getEffectiveSubscriptionTier(
      user as Parameters<typeof getEffectiveSubscriptionTier>[0]
    );
  } catch {
    /* ignore */
  }

  const cartItems = readJsonArray('cartItems');
  if (cartItems.length > 0) {
    const unitNames = cartItems
      .map((i) => String(i.name ?? '').trim())
      .filter(Boolean)
      .slice(0, 8);
    ctx.cart = {
      itemCount: cartItems.length,
      unitNames,
      hasOutOfStock: cartItems.some((i) => String(i.stockStatus ?? '') === 'out_of_stock'),
    };
  }

  const email = getCurrentUserEmailFromStorage();
  if (email) {
    const orders = readUserOrders(email);
    const unsigned = orders.filter(isUnsignedFormOrder);
    const expiringConsult = orders.filter((o) => isExpiringConsultOffer(o));
    if (unsigned.length || expiringConsult.length) {
      ctx.orders = {
        unsignedFormCount: unsigned.length,
        unsignedFormOrderNumbers: unsigned.map(orderNumberDisplay).filter(Boolean).slice(0, 5),
        expiringConsultCount: expiringConsult.length,
        expiringConsultOrderNumbers: expiringConsult.map(orderNumberDisplay).filter(Boolean).slice(0, 5),
      };
    }
    const stockAlerts = countUnreadStockAlerts(email);
    if (stockAlerts > 0) ctx.unreadStockAlertCount = stockAlerts;
  }

  ctx.slayReadiness = computePsaSlayReadiness();

  const bawTarget = detectPsaBawResumeTarget(pathname);
  if (bawTarget) {
    ctx.bawDraft = {
      unitLabel: bawTarget.unitLabel,
      buildPath: bawTarget.buildPath,
      source: bawTarget.source,
    };
  }

  if (pendingMessage) {
    const mode = inferModeFromMessage(pendingMessage);
    if (mode) ctx.mode = mode;
  }

  return ctx;
}
