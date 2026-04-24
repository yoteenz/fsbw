import Globe from 'globe.gl';

const BRAND_RED = '#EB1C24';
const ORDER_GREEN = '#16a34a';

type PointRow = { lat: number; lng: number; label: string; kind: 'visitor' | 'order' };
type ArcRow = { startLat: number; startLng: number; endLat: number; endLng: number; color: string | string[] };
type Weighted = { lat: number; lng: number; w: number };

/** Land dot on sphere (not a visitor/order marker). */
type LandDot = { lat: number; lng: number; _land: true; _lat: number };

const MSG_IN = 'fsbw-admin-globe';
const MSG_POINT = 'fsbw-admin-globe-point';
const MSG_READY = 'fsbw-admin-globe-ready';

const GOLD = Math.PI * (3 - Math.sqrt(5));

/** Rough lat/lng boxes (union) — coarse land mask. */
const LAND_BOXES: Array<[number, number, number, number]> = [
  [10, 75, -168, -48],
  [-56, 15, -82, -34],
  [33, 72, -12, 42],
  [-35, 38, -20, 52],
  [-12, 12, 95, 155],
  [5, 50, 70, 150],
  [18, 50, 25, 65],
  [42, 55, -125, -95],
  [50, 72, 25, 180],
  [50, 72, -180, -130],
];

function isLand(lat: number, lng: number): boolean {
  let x = lng;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  for (const [latMin, latMax, lngMin, lngMax] of LAND_BOXES) {
    if (lat >= latMin && lat <= latMax && x >= lngMin && x <= lngMax) return true;
  }
  return false;
}

/**
 * Fibonacci sphere lattice — lng MUST be atan2(z, x), NOT atan2(sinθ·r, cosθ·r)
 * (the wrong formula collapses longitude to ~±90° and draws a “C” patch).
 */
function fibonacciLatLng(i: number, n: number): { lat: number; lng: number } {
  const y = 1 - (i / Math.max(1, n - 1)) * 2;
  const yr = Math.max(-1, Math.min(1, y));
  const r = Math.sqrt(Math.max(0, 1 - yr * yr));
  const theta = GOLD * i;
  const x = Math.cos(theta) * r;
  const z = Math.sin(theta) * r;
  const lat = (Math.asin(yr) * 180) / Math.PI;
  const lng = (Math.atan2(z, x) * 180) / Math.PI;
  return { lat, lng };
}

function generateLandDots(target: number): LandDot[] {
  const out: LandDot[] = [];
  const n = 220000;
  for (let i = 0; i < n && out.length < target; i++) {
    const { lat, lng } = fibonacciLatLng(i, n);
    if (isLand(lat, lng)) {
      out.push({ lat, lng, _land: true, _lat: lat });
    }
  }
  return out;
}

function landDotColor(lat: number): string {
  const t = Math.max(-1, Math.min(1, (lat + 10) / 70));
  const mint = { r: 110, g: 231, b: 183 };
  const sky = { r: 125, g: 211, b: 252 };
  const r = Math.round(mint.r + (sky.r - mint.r) * t);
  const g = Math.round(mint.g + (sky.g - mint.g) * t);
  const b = Math.round(mint.b + (sky.b - mint.b) * t);
  return `rgb(${r},${g},${b})`;
}

function buildHotBinJitter(rows: PointRow[]): Weighted[] {
  const pts: Weighted[] = [];
  for (const r of rows) {
    for (let k = 0; k < 24; k++) {
      pts.push({
        lat: r.lat + (Math.random() - 0.5) * 0.55,
        lng: r.lng + (Math.random() - 0.5) * 0.55,
        w: 1,
      });
    }
  }
  return pts;
}

function buildArcs(visitors: PointRow[], orders: PointRow[]): ArcRow[] {
  const orderOnly = orders.filter((p) => p.kind === 'order');
  if (orderOnly.length === 0) return [];
  const hub = visitors[0] ?? orderOnly[0];
  if (!hub) return [];
  const max = 16;
  const out: ArcRow[] = [];
  const green = 'rgba(22, 163, 74, 0.38)';
  const greenF = 'rgba(22, 163, 74, 0.1)';
  for (let i = 0; i < Math.min(orderOnly.length, max); i++) {
    const o = orderOnly[i];
    if (!o) continue;
    out.push({
      startLat: hub.lat,
      startLng: hub.lng,
      endLat: o.lat,
      endLng: o.lng,
      color: [green, greenF],
    });
  }
  return out;
}

function splitPoints(rows: PointRow[]): { visitors: PointRow[]; orders: PointRow[] } {
  const visitors = rows.filter((p) => p.kind === 'visitor');
  const orders = rows.filter((p) => p.kind === 'order');
  return { visitors, orders };
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root missing');
const root = rootEl;

function readSize(): { w: number; h: number } {
  const r = root.getBoundingClientRect();
  const w = Math.max(120, Math.round(r.width || root.clientWidth || 300));
  const h = Math.max(120, Math.round(r.height || root.clientHeight || 240));
  return { w, h };
}

const LAND_STATIC = generateLandDots(7500);

const globe = new Globe(root, {
  rendererConfig: { alpha: false, antialias: false, powerPreference: 'low-power' },
  waitForGlobeReady: false,
})
  .backgroundColor('#f4f4f5')
  .showGlobe(false)
  .showGraticules(false)
  .showAtmosphere(true)
  .atmosphereColor('rgba(125, 211, 252, 0.45)')
  .atmosphereAltitude(0.14)
  .hexBinPointsData([])
  .hexBinPointLat('lat')
  .hexBinPointLng('lng')
  .hexBinPointWeight('w')
  .hexBinResolution(2.8)
  .hexMargin(0.08)
  .hexAltitude((bin) => {
    const w = bin.sumWeight || 0;
    if (w < 3) return 0.001;
    return 0.02 + Math.min(0.16, Math.sqrt(w) * 0.018);
  })
  .hexTopColor(() => '#1d4ed8')
  .hexSideColor(() => '#1e3a8a')
  .hexBinMerge(false)
  .hexTransitionDuration(400)
  .pointLat('lat')
  .pointLng('lng')
  .pointColor((d: object) => {
    const o = d as LandDot | PointRow;
    if ('_land' in o && o._land) return landDotColor((o as LandDot)._lat);
    return (o as PointRow).kind === 'visitor' ? BRAND_RED : ORDER_GREEN;
  })
  .pointAltitude((d: object) => {
    const o = d as LandDot | PointRow;
    return '_land' in o && o._land ? 0.0035 : 0.038;
  })
  .pointRadius((d: object) => {
    const o = d as LandDot | PointRow;
    return '_land' in o && o._land ? 0.1 : 0.52;
  })
  .pointResolution(7)
  .arcStartLat('startLat')
  .arcStartLng('startLng')
  .arcEndLat('endLat')
  .arcEndLng('endLng')
  .arcColor('color')
  .arcAltitude(0.16)
  .arcStroke(0.38)
  .arcDashLength(0.32)
  .arcDashGap(1.6)
  .arcDashAnimateTime(11000);

globe.pointOfView({ lat: 22, lng: -95, altitude: 2.2 }, 0);
try {
  const c = globe.controls();
  c.autoRotate = true;
  c.autoRotateSpeed = 0.3;
  c.enableDamping = true;
  c.dampingFactor = 0.08;
  c.minDistance = 200;
  c.maxDistance = 500;
} catch {
  /* optional */
}

function applySize() {
  const { w, h } = readSize();
  globe.width(w).height(h);
}
applySize();
requestAnimationFrame(() => {
  applySize();
  requestAnimationFrame(applySize);
});

globe.onPointClick((p: object) => {
  const row = p as LandDot | PointRow;
  if ('_land' in row && row._land) return;
  const pr = row as PointRow;
  const target = window.parent && window.parent !== window ? window.parent : null;
  if (!target) return;
  target.postMessage(
    {
      type: MSG_POINT,
      kind: pr.kind,
      label: pr.label,
      lat: pr.lat,
      lng: pr.lng,
    },
    '*'
  );
});

function applyPayload(rows: PointRow[]) {
  const { visitors, orders } = splitPoints(rows);
  const all: PointRow[] = [...visitors, ...orders];
  const hot = buildHotBinJitter(all);
  globe.hexBinPointsData(hot).pointsData([...LAND_STATIC, ...all]).arcsData(buildArcs(visitors, orders));
}

globe.pointsData(LAND_STATIC).hexBinPointsData([]).arcsData([]);

const ro = new ResizeObserver(() => {
  applySize();
});
ro.observe(root);

window.addEventListener('message', (event: MessageEvent) => {
  if (event.source !== window.parent) return;
  const d = event.data;
  if (!d || typeof d !== 'object' || d.type !== MSG_IN) return;
  const rows = d.points as unknown;
  if (!Array.isArray(rows)) return;
  const cleaned: PointRow[] = [];
  for (const r of rows) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    const lat = Number(o.lat);
    const lng = Number(o.lng);
    const label = typeof o.label === 'string' ? o.label : '';
    const kind = o.kind === 'order' ? 'order' : 'visitor';
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    cleaned.push({ lat, lng, label, kind });
  }
  applyPayload(cleaned);
});

function notifyReady() {
  window.parent.postMessage({ type: MSG_READY }, '*');
}
notifyReady();
requestAnimationFrame(() => notifyReady());
