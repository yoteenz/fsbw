/** Keep canceled orders out of active list; merge into past for orders UI + localStorage. */

import { SUBSCRIPTION_TIERS, type SubscriptionTierId } from '../constants/subscriptionPricing';

export function orderStatusIsCanceled(status: unknown): boolean {
  const s = String(status ?? '').toUpperCase();
  return s === 'CANCELED' || s === 'CANCELLED';
}

function orderIsCompleteConsultForArchive(o: { status?: string; bookingFlowType?: string }): boolean {
  if (String(o.bookingFlowType || '').trim().toLowerCase() !== 'consult') return false;
  return String(o.status || '').trim().toUpperCase() === 'COMPLETE';
}

/**
 * Remove CANCELED/CANCELLED from `active`; append each to `past` if not already present (by `id` when set).
 * **Consult** orders with status **COMPLETE** are also moved to **`past`** (archived card), not left on active.
 */
export function normalizeUserOrdersBuckets<T extends { id?: string; status?: string; bookingFlowType?: string }>(
  active: T[] | undefined,
  past: T[] | undefined
): { activeOrders: T[]; pastOrders: T[] } {
  const pastList = [...(past || [])];
  const pastIds = new Set(pastList.map((o) => o.id).filter(Boolean) as string[]);
  const appended: T[] = [];
  const nextActive: T[] = [];

  for (const o of active || []) {
    const moveToPast = orderStatusIsCanceled(o.status) || orderIsCompleteConsultForArchive(o);
    if (!moveToPast) {
      nextActive.push(o);
      continue;
    }
    const id = o.id;
    if (id && pastIds.has(id)) {
      continue;
    }
    if (id) pastIds.add(id);
    appended.push(o);
  }

  return { activeOrders: nextActive, pastOrders: [...pastList, ...appended] };
}

const SUBSCRIPTION_TIER_ORDER_NAMES = new Set(
  (Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTierId[]).map(
    (k) => SUBSCRIPTION_TIERS[k].name.toUpperCase()
  )
);

/**
 * Premium membership checkout (`/checkout/upgrade`) — not a product order for Account → Orders.
 * Detects persisted rows (flag) and legacy rows (digital-only + tier display name, not A/C booking).
 */
export function orderIsPremiumMembershipUpgradeOnly(o: Record<string, unknown>): boolean {
  if (o.isSubscriptionUpgrade === true) return true;
  const booking = String(o.bookingFlowType ?? '').trim().toLowerCase();
  if (booking === 'appointment' || booking === 'consult') return false;
  if (o.digitalFulfillmentOnly !== true) return false;
  const name = String(o.productName ?? '').toUpperCase().trim();
  return SUBSCRIPTION_TIER_ORDER_NAMES.has(name);
}

/** Strip membership-upgrade rows from persisted buckets (Account → Orders is for product / booking orders only). */
export function filterOutPremiumMembershipUpgradeOrders<T>(active: T[], past: T[]): { activeOrders: T[]; pastOrders: T[] } {
  const keep = (o: T) => !orderIsPremiumMembershipUpgradeOnly(o as Record<string, unknown>);
  return { activeOrders: active.filter(keep), pastOrders: past.filter(keep) };
}

/** Parse MM-DD-YYYY (common order `date` field) to epoch ms; 0 if invalid. */
function parseOrderDateField(dateStr: unknown): number {
  if (typeof dateStr !== 'string' || !dateStr.trim()) return 0;
  const m = dateStr.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    const ms = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  const d = Date.parse(dateStr);
  return Number.isNaN(d) ? 0 : d;
}

function coerceOrderFieldTimeMs(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    if (/^\d+$/.test(v)) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    if (v.includes('T') || v.includes('GMT') || /^\d{4}-\d{2}-\d{2}/.test(v)) {
      const t = Date.parse(v);
      if (!Number.isNaN(t)) return t;
    }
  }
  return null;
}

function orderFieldTimeMs(o: Record<string, unknown>, key: string): number | null {
  return coerceOrderFieldTimeMs(o[key]);
}

function firstPositiveTimeMs(
  o: Record<string, unknown>,
  keys: readonly string[]
): number {
  for (const k of keys) {
    const t = orderFieldTimeMs(o, k);
    if (t != null && t > 0) return t;
  }
  return 0;
}

/**
 * Best-effort "when did this order last move" for sorting (newest first).
 * Prefers explicit timestamps; falls back to `date` string.
 */
export function orderSortTimeMs(o: Record<string, unknown>): number {
  const keys = [
    'deliveredAt',
    'completedAt',
    'canceledAt',
    'placedAt',
    'updatedAt',
    'updated_at',
    'createdAt',
    'created_at',
  ] as const;
  for (const k of keys) {
    const t = orderFieldTimeMs(o, k);
    if (t != null && t > 0) return t;
  }
  return parseOrderDateField(o.date);
}

/**
 * **Archived / past** bucket: newest **finished** order first (completion, delivery, cancel time),
 * not "newest placed" — avoids old high order numbers sorting above recently archived rows.
 */
export function orderArchivedSortTimeMs(o: Record<string, unknown>): number {
  const st = String(o.status ?? '').toUpperCase();
  const dateMs = parseOrderDateField(o.date);
  if (orderStatusIsCanceled(st)) {
    const t = firstPositiveTimeMs(o, ['canceledAt', 'completedAt', 'deliveredAt', 'placedAt']);
    return t || dateMs;
  }
  if (st === 'COMPLETE') {
    const t = firstPositiveTimeMs(o, ['completedAt', 'deliveredAt', 'canceledAt', 'placedAt']);
    return t || dateMs;
  }
  if (st === 'DELIVERED') {
    const t = firstPositiveTimeMs(o, ['deliveredAt', 'completedAt', 'placedAt']);
    return t || dateMs;
  }
  const terminal = Math.max(
    orderFieldTimeMs(o, 'completedAt') ?? 0,
    orderFieldTimeMs(o, 'deliveredAt') ?? 0,
    orderFieldTimeMs(o, 'canceledAt') ?? 0
  );
  if (terminal > 0) return terminal;
  return orderSortTimeMs(o);
}

/**
 * **Active** bucket + mixed strips: sort by latest **activity** (status-related updates, processing start, etc.).
 */
export function orderActiveActivitySortTimeMs(o: Record<string, unknown>): number {
  const keys = [
    'updatedAt',
    'updated_at',
    'consultProcessingStartedAt',
    'deliveredAt',
    'completedAt',
    'canceledAt',
    'placedAt',
    'createdAt',
    'created_at',
  ] as const;
  let max = 0;
  for (const k of keys) {
    const t = orderFieldTimeMs(o, k);
    if (t != null && t > max) max = t;
  }
  if (max > 0) return max;
  return parseOrderDateField(o.date) || 0;
}

function sortOrdersByKey<T>(orders: T[], keyFn: (o: Record<string, unknown>) => number): T[] {
  return [...orders].sort((a, b) => {
    const dt = keyFn(b as Record<string, unknown>) - keyFn(a as Record<string, unknown>);
    if (dt !== 0) return dt;
    const idA = (a as { id?: string }).id ?? '';
    const idB = (b as { id?: string }).id ?? '';
    return String(idB).localeCompare(String(idA));
  });
}

/** Legacy sort: first non-zero field in `orderSortTimeMs` order (still used where a single key is enough). */
export function sortOrdersNewestFirst<T>(orders: T[]): T[] {
  return sortOrdersByKey(orders, orderSortTimeMs);
}

export function sortActiveOrdersByRecentActivityFirst<T>(orders: T[]): T[] {
  return sortOrdersByKey(orders, orderActiveActivitySortTimeMs);
}

export function sortArchivedOrdersNewestFirst<T>(orders: T[]): T[] {
  return sortOrdersByKey(orders, orderArchivedSortTimeMs);
}
