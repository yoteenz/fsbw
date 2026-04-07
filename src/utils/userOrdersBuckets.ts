/** Keep canceled orders out of active list; merge into past for orders UI + localStorage. */

import { SUBSCRIPTION_TIERS, type SubscriptionTierId } from '../constants/subscriptionPricing';

export function orderStatusIsCanceled(status: unknown): boolean {
  const s = String(status ?? '').toUpperCase();
  return s === 'CANCELED' || s === 'CANCELLED';
}

/**
 * Remove CANCELED/CANCELLED from `active`; append each to `past` if not already present (by `id` when set).
 */
export function normalizeUserOrdersBuckets<T extends { id?: string; status?: string }>(
  active: T[] | undefined,
  past: T[] | undefined
): { activeOrders: T[]; pastOrders: T[] } {
  const pastList = [...(past || [])];
  const pastIds = new Set(pastList.map((o) => o.id).filter(Boolean) as string[]);
  const appended: T[] = [];
  const nextActive: T[] = [];

  for (const o of active || []) {
    if (!orderStatusIsCanceled(o.status)) {
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
    const v = o[k];
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
  }
  return parseOrderDateField(o.date);
}

export function sortOrdersNewestFirst<T>(orders: T[]): T[] {
  return [...orders].sort((a, b) => {
    const dt = orderSortTimeMs(b as Record<string, unknown>) - orderSortTimeMs(a as Record<string, unknown>);
    if (dt !== 0) return dt;
    const idA = (a as { id?: string }).id ?? '';
    const idB = (b as { id?: string }).id ?? '';
    return String(idB).localeCompare(String(idA));
  });
}
