/**
 * Optional **worldwide mock** visitors + orders for Admin Revenue globe / Live View QA.
 *
 * Enable any one of:
 * - **`VITE_ADMIN_GLOBE_MOCK_DATA=1`** (or `true` / `yes`) in `.env.local` — rebuild dev / redeploy production.
 * - **`localStorage`** or **`sessionStorage`** key **`adminGlobeMockData`** = **`1`**, **`true`**, **`yes`**, or **`on`** (refresh).
 * - URL on Admin Revenue: **`?globe_mock=1`** (or **`true`**) — no persistence; works on production without env changes.
 */

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
  { visitor_id: 'mock-globe-tn', lat: 36.16, lng: -86.78, path: '/home/shop', city: 'Nashville', region: 'Tennessee', country: 'United States' },
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

function isTruthyMockFlag(val: string | null | undefined): boolean {
  const s = String(val ?? '').trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

/**
 * If `searchParams` includes **`globe_mock`** (truthy), persist **`sessionStorage.adminGlobeMockData=1`**
 * so mock globe data works without `.env` or `localStorage`. Call from Admin Revenue when the query is present.
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
    const q = new URLSearchParams(window.location.search).get('globe_mock');
    if (isTruthyMockFlag(q)) return true;
  } catch {
    /* ignore */
  }
  return false;
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

export function mergeMockOrderGlobePoints(real: MockGlobeOrderPoint[]): MockGlobeOrderPoint[] {
  if (!adminGlobeMockDataEnabled()) return real;
  const seen = new Set(real.map((p) => `${p.lat.toFixed(3)}|${p.lng.toFixed(3)}`));
  const extra = ADMIN_GLOBE_MOCK_ORDER_POINTS.filter((p) => {
    const k = `${p.lat.toFixed(3)}|${p.lng.toFixed(3)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return [...extra, ...real];
}
