import Globe from 'globe.gl';
import { loadLandSamplesForGlobe } from '@fsbw/adminGlobeNe110mLand';

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

/** Darker neutral land so it reads on the light→dark gray ocean (matches main SVG). */
function landDotColor(lat: number): string {
  const t = Math.max(0, Math.min(1, (lat + 10) / 70));
  const light = { r: 82, g: 82, b: 88 };
  const dark = { r: 28, g: 25, b: 26 };
  const r = Math.round(light.r + (dark.r - light.r) * t);
  const g = Math.round(light.g + (dark.g - light.g) * t);
  const b = Math.round(light.b + (dark.b - light.b) * t);
  return `rgb(${r},${g},${b})`;
}

/**
 * Radial light→dark gray as a data URL for `globeImageUrl`.
 * three-globe forces **black** when there is **no** `globeImageUrl`; swapping only
 * `globeMaterial()` in `onGlobeReady` is unreliable. The texture loader path sets map + clears color.
 */
function makeOceanGradientImageDataUrl(): string {
  const canvas = document.createElement('canvas');
  const sz = 512;
  canvas.width = sz;
  canvas.height = sz;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context');
  const cx = sz * 0.34;
  const cy = sz * 0.3;
  const g = ctx.createRadialGradient(cx, cy, sz * 0.06, sz * 0.5, sz * 0.5, sz * 0.52);
  g.addColorStop(0, '#e8e8ea');
  g.addColorStop(0.32, '#d4d4d8');
  g.addColorStop(0.68, '#90909a');
  g.addColorStop(1, '#5b5b66');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, sz, sz);
  return canvas.toDataURL('image/png');
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

const OCEAN_GRADIENT_DATA_URL = makeOceanGradientImageDataUrl();

const globe = new Globe(root, {
  /** Alpha so the iframe can sit on the storefront marble without a gray rectangle. */
  rendererConfig: { alpha: true, antialias: false, powerPreference: 'low-power' },
  /** Wait for base globe texture so the sphere is not a black placeholder on first paint. */
  waitForGlobeReady: true,
})
  .backgroundColor('rgba(0,0,0,0)')
  /** Required: three-globe paints black when `globeImageUrl` is unset; data URL loads like any map. */
  .globeImageUrl(OCEAN_GRADIENT_DATA_URL)
  .showGlobe(true)
  .showGraticules(false)
  .showAtmosphere(true)
  .atmosphereColor('rgba(148, 163, 184, 0.42)')
  .atmosphereAltitude(0.13)
  .hexBinPointsData([])
  .hexBinPointLat('lat')
  .hexBinPointLng('lng')
  .hexBinPointWeight('w')
  .hexBinResolution(2.8)
  .hexMargin(0.08)
  .hexAltitude((bin: { sumWeight?: number }) => {
    const w = bin.sumWeight || 0;
    if (w < 3) return 0.001;
    return 0.02 + Math.min(0.16, Math.sqrt(w) * 0.018);
  })
  .hexTopColor(() => '#475569')
  .hexSideColor(() => '#334155')
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

let landStatic: LandDot[] = [];
/** Latest visitor/order rows from parent (re-applied when land finishes loading). */
let lastRows: PointRow[] = [];

function applyPayload(rows: PointRow[]) {
  lastRows = rows;
  const { visitors, orders } = splitPoints(rows);
  const all: PointRow[] = [...visitors, ...orders];
  const hot = buildHotBinJitter(all);
  globe.hexBinPointsData(hot).pointsData([...landStatic, ...all]).arcsData(buildArcs(visitors, orders));
}

globe.pointsData([]).hexBinPointsData([]).arcsData([]);

void (async () => {
  try {
    const samples = await loadLandSamplesForGlobe(7200, '/ne_110m_land.geojson');
    landStatic = samples.map((s) => ({ lat: s.lat, lng: s.lng, _land: true as const, _lat: s.lat }));
  } catch {
    landStatic = [];
  }
  applyPayload(lastRows);
  notifyReady();
  requestAnimationFrame(() => notifyReady());
})();

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
