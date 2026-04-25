/**
 * Optional **worldwide mock** visitors + orders for Admin Revenue globe / Live View QA.
 *
 * Enable any one of:
 * - **`VITE_ADMIN_GLOBE_MOCK_DATA=1`** (or `true` / `yes`) in `.env.local` — rebuild dev / redeploy production.
 * - **`localStorage`** or **`sessionStorage`** key **`adminGlobeMockData`** = **`1`**, **`true`**, **`yes`**, or **`on`** (refresh).
 * - URL on Admin Revenue: **`?globe_mock=1`** (or **`true`**) — no persistence; works on production without env changes.
 */

import type { OrderGlobeClusterCustomer, OrderGlobeClusterPoint } from './adminOrderGlobeClusters';
import { landmarkForShipKey } from './adminOrderGlobeClusters';

export type MockGlobeVisitorPoint = {
  lat: number;
  lng: number;
  label: string;
  placeLine: string;
  placeDetail?: string;
};

export type MockGlobeOrderPoint = {
  lat: number;
  lng: number;
  label: string;
  placeLine: string;
  placeDetail?: string;
};

export type MockPresenceVisitorRow = {
  visitor_id: string;
  lat: number;
  lng: number;
  path: string | null;
  city?: string;
  region?: string;
  country?: string;
};

/** ~12 visitors across regions (paths for Live View card). */
export const ADMIN_GLOBE_MOCK_PRESENCE_ROWS: MockPresenceVisitorRow[] = [
  { visitor_id: 'mock-globe-tn', lat: 35.15, lng: -90.05, path: '/home/shop', city: 'Memphis', region: 'Tennessee', country: 'United States' },
  { visitor_id: 'mock-globe-ny', lat: 40.71, lng: -74.01, path: '/shop/units', city: 'New York', region: 'New York', country: 'United States' },
  { visitor_id: 'mock-globe-br', lat: -22.91, lng: -43.17, path: '/bag', city: 'Rio de Janeiro', region: 'RJ', country: 'Brazil' },
  { visitor_id: 'mock-globe-jp', lat: 35.68, lng: 139.76, path: '/build-a-wig', city: 'Tokyo', region: 'Tokyo', country: 'Japan' },
  { visitor_id: 'mock-globe-de', lat: 52.52, lng: 13.41, path: '/account', city: 'Berlin', region: 'Berlin', country: 'Germany' },
  { visitor_id: 'mock-globe-au', lat: -33.87, lng: 151.21, path: '/checkout', city: 'Sydney', region: 'NSW', country: 'Australia' },
  { visitor_id: 'mock-globe-za', lat: -26.2, lng: 28.04, path: '/', city: 'Johannesburg', region: 'Gauteng', country: 'South Africa' },
  { visitor_id: 'mock-globe-in', lat: 19.08, lng: 72.88, path: '/home/tools', city: 'Mumbai', region: 'Maharashtra', country: 'India' },
  { visitor_id: 'mock-globe-ca', lat: 43.65, lng: -79.38, path: '/wishlist', city: 'Toronto', region: 'Ontario', country: 'Canada' },
  { visitor_id: 'mock-globe-mx', lat: 19.43, lng: -99.13, path: '/sign-in', city: 'Mexico City', region: 'CDMX', country: 'Mexico' },
  { visitor_id: 'mock-globe-uk', lat: 51.51, lng: -0.13, path: '/admin/revenue', city: 'London', region: 'England', country: 'United Kingdom' },
  { visitor_id: 'mock-globe-fr', lat: 48.86, lng: 2.35, path: '/home/shop', city: 'Paris', region: 'Île-de-France', country: 'France' },
];

function visitorPointFromRow(v: MockPresenceVisitorRow): MockGlobeVisitorPoint {
  const geo = [v.city, v.region, v.country].filter(Boolean).join(', ') || 'ACTIVE';
  const fullLabel = `VISITOR · ${geo}${v.path ? ` · ${v.path}` : ''}`;
  return {
    lat: v.lat,
    lng: v.lng,
    label: fullLabel,
    placeLine: geo,
    placeDetail: 'VISITOR',
  };
}

export const ADMIN_GLOBE_MOCK_VISITOR_POINTS: MockGlobeVisitorPoint[] =
  ADMIN_GLOBE_MOCK_PRESENCE_ROWS.map(visitorPointFromRow);

/**
 * Shared mock **spenders** for order-cluster panels (derived from mock presence cities so QA looks realistic).
 * Merged into each mock cluster when **`adminGlobeMockDataEnabled()`**.
 */
export const ADMIN_GLOBE_MOCK_CLUSTER_CUSTOMER_POOL: OrderGlobeClusterCustomer[] = ADMIN_GLOBE_MOCK_PRESENCE_ROWS.map(
  (row, i) => ({
    email: `shopper.${String(row.city ?? 'global')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')}.${i}@mock.globe`,
    orderCount: 1 + (i % 4),
    totalSpent: 520 + i * 240 + (i % 3) * 110,
    topProduct: (['NOIR', 'BLANCO', 'SOFT CURL', 'OCEAN CURL', 'BEACH WAVE', 'NATURAL STRAIGHT'] as const)[i % 6]!,
  })
);

function augmentMockClusterCustomers(
  placeLine: string,
  orderCount: number,
  existing: OrderGlobeClusterCustomer[]
): OrderGlobeClusterCustomer[] {
  const slug = placeLine
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '')
    .slice(0, 28);
  const merged: OrderGlobeClusterCustomer[] = existing.map((c) => ({ ...c }));
  const seen = new Set(merged.map((c) => c.email.toLowerCase()));
  let pi = 0;
  const target = Math.max(4, Math.min(6, merged.length + 3));
  while (merged.length < target && pi < ADMIN_GLOBE_MOCK_CLUSTER_CUSTOMER_POOL.length) {
    const p = ADMIN_GLOBE_MOCK_CLUSTER_CUSTOMER_POOL[pi]!;
    pi += 1;
    const email = `${slug || 'cluster'}.${p.email}`;
    if (seen.has(email.toLowerCase())) continue;
    merged.push({
      ...p,
      email,
      orderCount: Math.max(1, p.orderCount),
      totalSpent: Math.max(199, p.totalSpent - pi * 17),
    });
    seen.add(email.toLowerCase());
  }
  merged.sort((a, b) => b.totalSpent - a.totalSpent);
  if (orderCount > 0 && merged[0]) {
    const head = merged[0];
    const rest = merged.slice(1);
    const sumRest = rest.reduce((s, c) => s + c.orderCount, 0);
    const headOrders = Math.max(1, orderCount - sumRest);
    merged.length = 0;
    merged.push({ ...head, orderCount: headOrders }, ...rest);
  }
  return merged;
}

/** ~10 mock order ship locations (distinct from visitor cities where possible). */
export const ADMIN_GLOBE_MOCK_ORDER_POINTS: MockGlobeOrderPoint[] = [
  {
    lat: 34.05,
    lng: -118.24,
    label: 'ORDER #MOCK-9001 · Los Angeles, CA, US',
    placeLine: 'Los Angeles, CA, US',
    placeDetail: 'ORDER #MOCK-9001',
  },
  {
    lat: 47.61,
    lng: -122.33,
    label: 'ORDER #MOCK-9002 · Seattle, WA, US',
    placeLine: 'Seattle, WA, US',
    placeDetail: 'ORDER #MOCK-9002',
  },
  {
    lat: 25.2,
    lng: 55.27,
    label: 'ORDER #MOCK-9003 · Dubai, AE',
    placeLine: 'Dubai, United Arab Emirates',
    placeDetail: 'ORDER #MOCK-9003',
  },
  {
    lat: 1.35,
    lng: 103.82,
    label: 'ORDER #MOCK-9004 · Singapore, SG',
    placeLine: 'Singapore, Singapore',
    placeDetail: 'ORDER #MOCK-9004',
  },
  {
    lat: 59.33,
    lng: 18.07,
    label: 'ORDER #MOCK-9005 · Stockholm, SE',
    placeLine: 'Stockholm, Sweden',
    placeDetail: 'ORDER #MOCK-9005',
  },
  {
    lat: -34.6,
    lng: -58.38,
    label: 'ORDER #MOCK-9006 · Buenos Aires, AR',
    placeLine: 'Buenos Aires, Argentina',
    placeDetail: 'ORDER #MOCK-9006',
  },
  {
    lat: 37.57,
    lng: 126.98,
    label: 'ORDER #MOCK-9007 · Seoul, KR',
    placeLine: 'Seoul, South Korea',
    placeDetail: 'ORDER #MOCK-9007',
  },
  {
    lat: -37.81,
    lng: 144.96,
    label: 'ORDER #MOCK-9008 · Melbourne, AU',
    placeLine: 'Melbourne, VIC, Australia',
    placeDetail: 'ORDER #MOCK-9008',
  },
  {
    lat: 55.76,
    lng: 37.62,
    label: 'ORDER #MOCK-9009 · Moscow, RU',
    placeLine: 'Moscow, Russia',
    placeDetail: 'ORDER #MOCK-9009',
  },
  {
    lat: 30.04,
    lng: 31.24,
    label: 'ORDER #MOCK-9010 · Cairo, EG',
    placeLine: 'Cairo, Egypt',
    placeDetail: 'ORDER #MOCK-9010',
  },
];

function mockClusterFromSingleOrder(p: MockGlobeOrderPoint): OrderGlobeClusterPoint {
  const key = p.placeLine.toUpperCase().replace(/\s+/g, ' ');
  const lm = landmarkForShipKey(key, p.placeLine);
  const base: OrderGlobeClusterCustomer[] = [
    {
      email: 'mock.customer@example.com',
      orderCount: 1,
      totalSpent: 899,
      topProduct: 'NOIR',
    },
  ];
  return {
    lat: p.lat,
    lng: p.lng,
    label: p.label,
    placeLine: p.placeLine,
    placeDetail: p.placeDetail ?? 'ORDER',
    clusterKey: `MOCK|${key}`,
    orderCount: 1,
    landmarkTitle: lm.title,
    landmarkSymbol: lm.symbol,
    towerHeight: 0.038,
    customers: augmentMockClusterCustomers(p.placeLine, 1, base),
  };
}

/** Heavy NYC cluster for QA: tall tower + multi-customer breakdown. */
function mockNycOrderCluster(): OrderGlobeClusterPoint {
  const placeLine = 'New York, NY, US';
  const lm = landmarkForShipKey('NEW YORK|NY|US', placeLine);
  return {
    lat: 40.7128,
    lng: -74.006,
    label: 'ORDER CLUSTER · 14 @ New York, NY, US',
    placeLine,
    placeDetail: '14 ORDERS',
    clusterKey: 'MOCK|NEW YORK|NY|US',
    orderCount: 14,
    landmarkTitle: lm.title,
    landmarkSymbol: lm.symbol,
    towerHeight: 0.042 + Math.min(0.14, 13 * 0.012),
    customers: augmentMockClusterCustomers(placeLine, 14, [
      { email: 'vip.nyc@example.com', orderCount: 6, totalSpent: 12540, topProduct: 'NOIR' },
      { email: 'repeat.nyc@example.com', orderCount: 5, totalSpent: 4820, topProduct: 'BLANCO' },
      { email: 'new.nyc@example.com', orderCount: 3, totalSpent: 2199, topProduct: 'SOFT CURL' },
    ]),
  };
}

function isTruthyMockFlag(val: string | null | undefined): boolean {
  const s = String(val ?? '').trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

/** `globe_mock` in normal query or after `#` (some hosts / bookmarks put params only in the hash). */
export function globeMockFlagInBrowserLocation(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (isTruthyMockFlag(new URLSearchParams(window.location.search).get('globe_mock'))) return true;
    const h = window.location.hash;
    const qi = h.indexOf('?');
    if (qi >= 0) {
      const hp = new URLSearchParams(h.slice(qi + 1));
      if (isTruthyMockFlag(hp.get('globe_mock'))) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * If the URL (search **or** hash query) includes **`globe_mock`** (truthy), persist **`sessionStorage.adminGlobeMockData=1`**
 * so the flag survives tab navigations. Returns whether the flag was found.
 */
export function persistGlobeMockFromBrowserLocation(): boolean {
  if (!globeMockFlagInBrowserLocation()) return false;
  try {
    if (typeof window !== 'undefined') window.sessionStorage.setItem('adminGlobeMockData', '1');
  } catch {
    /* ignore */
  }
  return true;
}

/**
 * If React Router `searchParams` includes **`globe_mock`** (truthy), persist session flag (same as location).
 */
export function persistGlobeMockFromSearchParams(searchParams: { get: (k: string) => string | null }): boolean {
  if (!isTruthyMockFlag(searchParams.get('globe_mock'))) return false;
  try {
    if (typeof window !== 'undefined') window.sessionStorage.setItem('adminGlobeMockData', '1');
  } catch {
    /* ignore */
  }
  return true;
}

export function adminGlobeMockDataEnabled(): boolean {
  try {
    const env = (import.meta as unknown as { env?: { VITE_ADMIN_GLOBE_MOCK_DATA?: string } }).env?.VITE_ADMIN_GLOBE_MOCK_DATA;
    if (isTruthyMockFlag(String(env ?? '').trim())) return true;
  } catch {
    /* ignore */
  }
  try {
    if (typeof window === 'undefined') return false;
    if (isTruthyMockFlag(window.localStorage?.getItem('adminGlobeMockData'))) return true;
    if (isTruthyMockFlag(window.sessionStorage?.getItem('adminGlobeMockData'))) return true;
    if (globeMockFlagInBrowserLocation()) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** Turn on mock globe data for this browser (session) and return true. */
export function enableAdminGlobeMockDataSession(): void {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.setItem('adminGlobeMockData', '1');
  } catch {
    /* ignore */
  }
}

export function disableAdminGlobeMockDataSession(): void {
  try {
    window.sessionStorage?.removeItem('adminGlobeMockData');
    window.localStorage?.removeItem('adminGlobeMockData');
  } catch {
    /* ignore */
  }
}

/** Mock order **clusters** merged with real clusters when mock mode is on. */
export function mergeMockOrderGlobeClusters(real: OrderGlobeClusterPoint[]): OrderGlobeClusterPoint[] {
  if (!adminGlobeMockDataEnabled()) return real;
  const seen = new Set(real.map((c) => c.clusterKey));
  const singles = ADMIN_GLOBE_MOCK_ORDER_POINTS.map(mockClusterFromSingleOrder).filter((c) => {
    if (seen.has(c.clusterKey)) return false;
    seen.add(c.clusterKey);
    return true;
  });
  const nyc = mockNycOrderCluster();
  const extra = seen.has(nyc.clusterKey) ? [] : [nyc];
  return [...extra, ...singles, ...real];
}

export function mergeMockPresenceRows(real: MockPresenceVisitorRow[]): MockPresenceVisitorRow[] {
  if (!adminGlobeMockDataEnabled()) return real;
  const seen = new Set(real.map((r) => String(r.visitor_id ?? '').trim()).filter(Boolean));
  const extra = ADMIN_GLOBE_MOCK_PRESENCE_ROWS.filter((m) => !seen.has(m.visitor_id));
  return [...extra, ...real];
}

export function mergeMockVisitorGlobePoints(real: MockGlobeVisitorPoint[]): MockGlobeVisitorPoint[] {
  if (!adminGlobeMockDataEnabled()) return real;
  const seen = new Set(real.map((p) => `${p.lat.toFixed(3)}|${p.lng.toFixed(3)}`));
  const extra = ADMIN_GLOBE_MOCK_VISITOR_POINTS.filter((p) => {
    const k = `${p.lat.toFixed(3)}|${p.lng.toFixed(3)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return [...extra, ...real];
}

