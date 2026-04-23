import Globe from 'globe.gl';

const BRAND_RED = '#EB1C24';
const ORDER_GREEN = '#16a34a';
/** Raw GitHub (master) — version tag path 404s in npm package; master hosts example/img. */
const TEX_BASE = 'https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img';
const GLOBE_TEXTURE = `${TEX_BASE}/earth-dark.jpg`;
const GLOBE_BUMP = `${TEX_BASE}/earth-topology.png`;

type PointRow = { lat: number; lng: number; label: string; kind: 'visitor' | 'order' };
type ArcRow = { startLat: number; startLng: number; endLat: number; endLng: number; color: string | string[] };

const MSG_IN = 'fsbw-admin-globe';
const MSG_POINT = 'fsbw-admin-globe-point';
const MSG_READY = 'fsbw-admin-globe-ready';

function buildArcs(visitors: PointRow[], orders: PointRow[]): ArcRow[] {
  const orderOnly = orders.filter((p) => p.kind === 'order');
  if (orderOnly.length === 0) return [];
  const hub = visitors[0] ?? orderOnly[0];
  if (!hub) return [];
  const max = 16;
  const out: ArcRow[] = [];
  const green = 'rgba(22, 163, 74, 0.42)';
  const greenF = 'rgba(22, 163, 74, 0.12)';
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

const globe = new Globe(root, {
  rendererConfig: { alpha: false, antialias: false, powerPreference: 'low-power' },
  /** Do not block first paint forever if a texture URL is slow or blocked. */
  waitForGlobeReady: false,
})
  .backgroundColor('rgb(2, 6, 23)')
  .globeImageUrl(GLOBE_TEXTURE)
  .bumpImageUrl(GLOBE_BUMP)
  .showGraticules(true)
  .showAtmosphere(true)
  .atmosphereColor('rgba(96, 165, 250, 0.45)')
  .atmosphereAltitude(0.18)
  .pointLat('lat')
  .pointLng('lng')
  .pointColor((d: object) => ((d as PointRow).kind === 'visitor' ? BRAND_RED : ORDER_GREEN))
  .pointAltitude(0.012)
  .pointRadius(0.42)
  .pointResolution(10)
  .arcStartLat('startLat')
  .arcStartLng('startLng')
  .arcEndLat('endLat')
  .arcEndLng('endLng')
  .arcColor('color')
  .arcAltitude(0.22)
  .arcStroke(0.45)
  .arcDashLength(0.4)
  .arcDashGap(2)
  .arcDashAnimateTime(12000);

globe.pointOfView({ lat: 22, lng: -95, altitude: 2.35 }, 0);
try {
  const c = globe.controls();
  c.autoRotate = true;
  c.autoRotateSpeed = 0.35;
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

function applyPayload(rows: PointRow[]) {
  const { visitors, orders } = splitPoints(rows);
  const all: PointRow[] = [...visitors, ...orders];
  globe.pointsData(all).arcsData(buildArcs(visitors, orders));
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
