import Globe from 'globe.gl';

const BRAND_RED = '#EB1C24';
const ORDER_GREEN = '#16a34a';
const GLOBE_TEXTURE = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.2/example/img/earth-dark.jpg';
const GLOBE_BUMP = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.2/example/img/earth-topology.png';

type PointRow = { lat: number; lng: number; label: string; kind: 'visitor' | 'order' };
type ArcRow = { startLat: number; startLng: number; endLat: number; endLng: number; color: string | string[] };

const MSG_IN = 'fsbw-admin-globe';
const MSG_POINT = 'fsbw-admin-globe-point';

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

const root = document.getElementById('root');
if (!root) throw new Error('#root missing');

const globe = new Globe(root, {
  rendererConfig: { alpha: true, antialias: false, powerPreference: 'low-power' },
})
  .backgroundColor('rgba(2, 6, 23, 0)')
  .globeImageUrl(GLOBE_TEXTURE)
  .bumpImageUrl(GLOBE_BUMP)
  .showGraticules(true)
  .showAtmosphere(true)
  .atmosphereColor('rgba(96, 165, 250, 0.45)')
  .atmosphereAltitude(0.18)
  .width(root.clientWidth || 300)
  .height(root.clientHeight || 240)
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
  globe.width(root.clientWidth);
  globe.height(root.clientHeight);
});
ro.observe(root);
globe.width(root.clientWidth);
globe.height(root.clientHeight);

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

window.parent.postMessage({ type: 'fsbw-admin-globe-ready' }, '*');
