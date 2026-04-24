import Globe from 'globe.gl';

const BRAND_RED = '#EB1C24';
const ORDER_GREEN = '#16a34a';

type PointRow = { lat: number; lng: number; label: string; kind: 'visitor' | 'order' };
type ArcRow = { startLat: number; startLng: number; endLat: number; endLng: number; color: string | string[] };
type Weighted = { lat: number; lng: number; w: number };

const MSG_IN = 'fsbw-admin-globe';
const MSG_POINT = 'fsbw-admin-globe-point';
const MSG_READY = 'fsbw-admin-globe-ready';

/** Rough lat/lng boxes (union) → dot “continents” without GeoJSON fetch. */
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

function generateLandHexPoints(target: number): Weighted[] {
  const out: Weighted[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  let i = 0;
  while (out.length < target && i < 200000) {
    const y = 1 - (i / 120000) * 2;
    const yr = Math.min(1, Math.max(-1, y));
    const r = Math.sqrt(Math.max(0, 1 - yr * yr));
    const θ = golden * i;
    const lat = (Math.asin(yr) * 180) / Math.PI;
    const lng = ((Math.atan2(Math.sin(θ) * r, Math.cos(θ) * r) * 180) / Math.PI);
    if (isLand(lat, lng)) {
      out.push({ lat, lng, w: 1 });
    }
    i++;
  }
  return out;
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

const landPoints = generateLandHexPoints(3200);

const globe = new Globe(root, {
  rendererConfig: { alpha: false, antialias: false, powerPreference: 'low-power' },
  waitForGlobeReady: false,
})
  .backgroundColor('#e4e4e7')
  .showGlobe(false)
  .showGraticules(false)
  .showAtmosphere(true)
  .atmosphereColor('rgba(148, 163, 184, 0.35)')
  .atmosphereAltitude(0.12)
  .hexBinPointsData(landPoints)
  .hexBinPointLat('lat')
  .hexBinPointLng('lng')
  .hexBinPointWeight('w')
  .hexBinResolution(3.6)
  .hexMargin(0.12)
  .hexAltitude((bin) => {
    const w = bin.sumWeight || 0;
    return 0.018 + Math.min(0.14, Math.sqrt(w) * 0.022);
  })
  .hexTopColor(() => '#57534e')
  .hexSideColor(() => '#3f3f46')
  .hexBinMerge(true)
  .hexTransitionDuration(400)
  .pointLat('lat')
  .pointLng('lng')
  .pointColor((d: object) => ((d as PointRow).kind === 'visitor' ? BRAND_RED : ORDER_GREEN))
  .pointAltitude(0.035)
  .pointRadius(0.55)
  .pointResolution(12)
  .arcStartLat('startLat')
  .arcStartLng('startLng')
  .arcEndLat('endLat')
  .arcEndLng('endLng')
  .arcColor('color')
  .arcAltitude(0.18)
  .arcStroke(0.4)
  .arcDashLength(0.35)
  .arcDashGap(1.8)
  .arcDashAnimateTime(11000);

globe.pointOfView({ lat: 22, lng: -95, altitude: 2.25 }, 0);
try {
  const c = globe.controls();
  c.autoRotate = true;
  c.autoRotateSpeed = 0.32;
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
  const row = p as PointRow;
  const target = window.parent && window.parent !== window ? window.parent : null;
  if (!target) return;
  target.postMessage(
    {
      type: MSG_POINT,
      kind: row.kind,
      label: row.label,
      lat: row.lat,
      lng: row.lng,
    },
    '*'
  );
});

function combinedHexPoints(rows: PointRow[]): Weighted[] {
  const extra = rows.map((r) => ({ lat: r.lat, lng: r.lng, w: 12 }));
  return [...landPoints, ...extra];
}

function applyPayload(rows: PointRow[]) {
  const { visitors, orders } = splitPoints(rows);
  const all: PointRow[] = [...visitors, ...orders];
  globe.hexBinPointsData(combinedHexPoints(all)).pointsData(all).arcsData(buildArcs(visitors, orders));
}

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
