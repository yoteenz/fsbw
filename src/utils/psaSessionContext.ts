/**
 * Client session snapshot sent with each PSA chat message — page, tier, cart, orders.
 */
import {
  getEffectiveSubscriptionTier,
  getEffectiveTierName,
} from './adminAuth';
import { getCurrentUserEmailFromStorage, getCurrentUserFirstNameFromStorage } from './perUserStorage';
import { formatPsaMemberFirstName } from '../constants/psaConfig';
import { resolvePsaWelcomeKind, type PsaWelcomeKind } from './psaWelcomeState';
import { orderNeedsClientAuthFormSignature } from './giftCardFirstPurchaseForm';
import type { ConsultOfferPersistedSnapshot } from './consultOfferFromQuote';
import { detectPsaBawResumeTarget } from './psaBawDraft';
import { computePsaSlayReadiness } from './psaSlayReadiness';
import { buildPsaSlayJournalSnapshot } from './psaSlayJournal';
import { resolvePsaMood, type PsaMoodId } from './psaMood';
import { isRedCarpetModeActive, isRedCarpetTriggerMessage } from './psaRedCarpetMode';

export type PsaSessionMode =
  | 'talk_me_out_of_it'
  | 'event_ready'
  | 'what_would_you_pick'
  | 'what_might_i_regret'
  | 'slay_forecast'
  | 'build_my_look'
  | 'why_this'
  | 'red_carpet';

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
  redCarpetMode?: boolean;
  welcomeKind?: PsaWelcomeKind;
  mood?: PsaMoodId;
  moodReason?: string;
  journal?: ReturnType<typeof buildPsaSlayJournalSnapshot>;
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
  if (t.includes('WHY THIS') || t.includes('WHY DID YOU PICK')) {
    return 'why_this';
  }
  if (t.includes('WHAT MIGHT I REGRET') || t.includes('MIGHT I REGRET')) {
    return 'what_might_i_regret';
  }
  if (
    t.includes('SHOULD I REALLY BUY') ||
    t.includes('TALK ME OUT OF IT') ||
    t.includes('SHOULD I UPGRADE') ||
    t.includes('DO I NEED THIS')
  ) {
    return 'talk_me_out_of_it';
  }
  if (t.includes('BUILD MY ENTIRE LOOK') || t.includes('BUILD MY WHOLE LOOK')) {
    return 'build_my_look';
  }
  if (isRedCarpetTriggerMessage(message)) {
    return 'red_carpet';
  }
  if (
    t.includes('SLAY FORECAST') ||
    t.includes('GOING TO MIAMI') ||
    t.includes('GOING TO VEGAS') ||
    t.includes('EVENT READY') ||
    t.includes('WEDDING') ||
    t.includes('GET ME READY FOR')
  ) {
    return t.includes('SLAY FORECAST') || /GOING TO|MIAMI|VEGAS|WEDDING/i.test(t)
      ? 'slay_forecast'
      : 'event_ready';
  }
  if (t.includes('WHAT WOULD YOU PICK') || t.includes('WHAT WOULD YOU CHOOSE')) {
    return 'what_would_you_pick';
  }
  return undefined;
}

function detectRecentOrderSignals(orders: Record<string, unknown>[]): {
  hasRecentPlacedOrder: boolean;
  hasDeliveredOrder: boolean;
} {
  const now = Date.now();
  const placedWindow = 48 * 60 * 60 * 1000;
  const deliveredWindow = 72 * 60 * 60 * 1000;
  let hasRecentPlacedOrder = false;
  let hasDeliveredOrder = false;

  for (const order of orders) {
    const status = String(order.status || '').toUpperCase();
    const placedAt = typeof order.placedAt === 'number' ? order.placedAt : 0;
    if (
      (status === 'PLACED' || status === 'CONFIRMED' || status === 'PROCESSING') &&
      placedAt > 0 &&
      now - placedAt <= placedWindow
    ) {
      hasRecentPlacedOrder = true;
    }
    if (status === 'DELIVERED' && placedAt > 0 && now - placedAt <= deliveredWindow) {
      hasDeliveredOrder = true;
    }
  }

  return { hasRecentPlacedOrder, hasDeliveredOrder };
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

  let tierLabel: string | null = null;
  try {
    const rawUser = localStorage.getItem('currentUser');
    const user = rawUser ? (JSON.parse(rawUser) as Record<string, unknown>) : null;
    tierLabel = getEffectiveTierName(user as Parameters<typeof getEffectiveTierName>[0]);
    ctx.tierLabel = tierLabel;
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
  let allOrders: Record<string, unknown>[] = [];
  if (email) {
    allOrders = readUserOrders(email);
    const unsigned = allOrders.filter(isUnsignedFormOrder);
    const expiringConsult = allOrders.filter((o) => isExpiringConsultOffer(o));
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

  if (isRedCarpetModeActive()) {
    ctx.redCarpetMode = true;
    if (!ctx.mode) ctx.mode = 'red_carpet';
  }

  ctx.welcomeKind = resolvePsaWelcomeKind();

  ctx.journal = buildPsaSlayJournalSnapshot();

  const orderSignals = detectRecentOrderSignals(allOrders);
  const mood = resolvePsaMood({
    mode: ctx.mode,
    tierLabel,
    pendingMilestone: ctx.journal.pendingMilestone,
    ...orderSignals,
  });
  ctx.mood = mood.mood;
  ctx.moodReason = mood.moodReason;

  return ctx;
}
