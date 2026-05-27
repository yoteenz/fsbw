/**
 * Build **one globe point per ship-to location cluster** for Admin Revenue orders,
 * with spenders + landmark metadata for the WebGL embed (towers + HTML markers).
 */

import { orderShippingToGlobePoint, type ShippingLike } from './orderShippingToGlobePoint';
import { orderPlaceFieldsFromGlobeLabel } from './adminGlobePlaceLabel';
import { landmarkForGeographicText } from './adminGlobeGeographicLandmark';

export type RevenueOrderLike = {
  id?: string;
  orderNumber?: string;
  userEmail?: string;
  total?: number;
  amount?: number;
  /** Order date (ISO or parseable) — used for "most recent" unit. */
  date?: string;
  status?: string;
  shippingAddress?: ShippingLike | null;
  lineItems?: Array<{ productName?: string; subtotal?: number; options?: Record<string, string> }>;
  productName?: string;
};

export type OrderGlobeClusterCustomer = {
  email: string;
  orderCount: number;
  totalSpent: number;
  /**
   * Most **recent** unit in **`UNIT · CAP`** (was `topProduct` — by frequency / spend).
   * @deprecated Use **`recentUnitName`**. Kept for older embeds / JSON.
   */
  topProduct?: string;
  /** @deprecated See **`recentUnitCapSize`**. */
  topProductCapSize?: string;
  /**
   * Unit from the **most recent** relevant order: prefers latest **delivered / shipped / fulfilled** order, else latest order;
   * product is the **last line** on that order.
   */
  recentUnitName: string;
  /** Cap size for **`recentUnitName`** from that line’s options. */
  recentUnitCapSize?: string;
  /** Filled by `enrichOrderGlobeClusterCustomers` from `registeredUsers` when available. */
  displayName?: string;
  profileImageUrl?: string;
  age?: number | null;
};

export type OrderGlobeClusterPoint = {
  lat: number;
  lng: number;
  label: string;
  placeLine: string;
  placeDetail: string;
  clusterKey: string;
  orderCount: number;
  landmarkTitle: string;
  landmarkSymbol: string;
  towerHeight: number;
  customers: OrderGlobeClusterCustomer[];
};

function normShipKey(ship: ShippingLike): string {
  const city = String(ship.city ?? '')
    .trim()
    .toUpperCase();
  const state = String(ship.state ?? '')
    .trim()
    .toUpperCase()
    .slice(0, 8);
  const country = String(ship.country ?? '')
    .trim()
    .toUpperCase()
    .slice(0, 24);
  return `${city}|${state}|${country}` || 'UNKNOWN';
}

function capSizeFromLineItemOptions(options?: Record<string, string> | null): string | null {
  if (!options || typeof options !== 'object') return null;
  const raw =
    (options['CAP SIZE'] as string | undefined) ||
    (options['Cap size'] as string | undefined) ||
    (options['cap size'] as string | undefined) ||
    (options.capSize as string | undefined);
  const s = String(raw ?? '')
    .trim()
    .toUpperCase();
  return s || null;
}

type LineItemLike = { productName?: string; subtotal?: number; options?: Record<string, string> };

function orderDateMs(o: RevenueOrderLike): number {
  const t = new Date(String(o.date ?? '')).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Delivered / shipped / fulfilled — "ordered/delivered" as requested. */
function isTerminalFulfilmentStatus(o: RevenueOrderLike): boolean {
  const s = String(o.status ?? '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) return false;
  return (
    s === 'DELIVERED' ||
    s === 'SHIPPED' ||
    s === 'FULFILLED' ||
    s === 'COMPLETE' ||
    s === 'COMPLETED'
  );
}

function lineItemsForOrder(o: RevenueOrderLike): LineItemLike[] {
  if (o.lineItems?.length) return o.lineItems;
  if (o.productName && String(o.productName).trim()) {
    return [{ productName: o.productName, subtotal: o.total ?? o.amount, options: undefined }];
  }
  return [];
}

/**
 * **Most recent** line item: last line on the latest relevant order
 * (prefer most recent with terminal status; else most recent by date).
 */
function mostRecentLineItem(orders: RevenueOrderLike[]): { name: string; cap: string | null } | null {
  if (orders.length === 0) return null;
  const withDate = orders.filter((o) => orderDateMs(o) > 0);
  const pool = withDate.length ? withDate : orders;
  const terminal = pool.filter(isTerminalFulfilmentStatus);
  const chosen =
    terminal.length > 0
      ? terminal.reduce((a, b) => (orderDateMs(b) > orderDateMs(a) ? b : a))
      : pool.reduce((a, b) => (orderDateMs(b) >= orderDateMs(a) ? b : a));
  const lines = lineItemsForOrder(chosen);
  if (!lines.length) return null;
  const li = lines[lines.length - 1]!;
  const name = String(li.productName ?? '').trim().toUpperCase();
  if (!name) return null;
  return { name, cap: capSizeFromLineItemOptions(li.options) };
}

/** Recognizable landmark label + emoji by city/region (see **`landmarkForGeographicText`**). */
export function landmarkForShipKey(clusterKey: string, placeLine: string): { title: string; symbol: string } {
  return landmarkForGeographicText(`${clusterKey} ${placeLine}`, 'order');
}

function towerHeightForOrderCount(n: number): number {
  if (n <= 1) return 0.038;
  return 0.042 + Math.min(0.14, (n - 1) * 0.012);
}

/**
 * One row per **distinct ship-to key** (city/state/country), capped for performance.
 */
export function buildOrderGlobeClustersFromRevenueOrders(orders: RevenueOrderLike[], maxClusters = 80): OrderGlobeClusterPoint[] {
  const buckets = new Map<
    string,
    { lat: number; lng: number; placeLine: string; ship: ShippingLike; orders: RevenueOrderLike[] }
  >();

  for (const o of orders) {
    const ship = o.shippingAddress;
    if (!ship || typeof ship !== 'object') continue;
    const pt = orderShippingToGlobePoint(ship as ShippingLike);
    if (!pt) continue;
    const key = normShipKey(ship as ShippingLike);
    const existing = buckets.get(key);
    if (!existing) {
      buckets.set(key, {
        lat: pt.lat,
        lng: pt.lng,
        placeLine: pt.label,
        ship: ship as ShippingLike,
        orders: [o],
      });
    } else {
      existing.orders.push(o);
      const n = existing.orders.length;
      existing.lat = (existing.lat * (n - 1) + pt.lat) / n;
      existing.lng = (existing.lng * (n - 1) + pt.lng) / n;
    }
  }

  const rows: OrderGlobeClusterPoint[] = [];
  for (const [shipKey, b] of buckets) {
    const byEmail = new Map<string, { orders: RevenueOrderLike[] }>();
    for (const o of b.orders) {
      const email = String(o.userEmail ?? 'unknown').trim() || 'unknown';
      let g = byEmail.get(email);
      if (!g) {
        g = { orders: [] };
        byEmail.set(email, g);
      }
      g.orders.push(o);
    }
    const customers: OrderGlobeClusterCustomer[] = [...byEmail.entries()].map(([email, g]) => {
      const totalSpent = g.orders.reduce((s, x) => s + (Number(x.total ?? x.amount) || 0), 0);
      const recent = mostRecentLineItem(g.orders);
      const recentUnitName = recent?.name ?? '—';
      return {
        email,
        orderCount: g.orders.length,
        totalSpent,
        recentUnitName,
        recentUnitCapSize: recent?.cap ?? undefined,
      };
    });
    customers.sort((a, b) => b.totalSpent - a.totalSpent);

    const orderCount = b.orders.length;
    const { title: landmarkTitle, symbol: landmarkSymbol } = landmarkForShipKey(shipKey, b.placeLine);
    const fullLabel = `ORDER CLUSTER · ${orderCount} @ ${b.placeLine}`;
    const place = orderPlaceFieldsFromGlobeLabel(fullLabel);

    rows.push({
      lat: b.lat,
      lng: b.lng,
      label: fullLabel,
      placeLine: place.placeLine || b.placeLine,
      placeDetail: `${orderCount} ORDERS`,
      clusterKey: shipKey,
      orderCount,
      landmarkTitle,
      landmarkSymbol,
      towerHeight: towerHeightForOrderCount(orderCount),
      customers,
    });
  }

  rows.sort((a, b) => b.orderCount - a.orderCount);
  return rows.slice(0, maxClusters);
}
