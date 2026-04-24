import Globe from 'globe.gl';
import { loadLandSamplesForGlobe } from '@fsbw/adminGlobeNe110mLand';

const BRAND_RED = '#EB1C24';
const ORDER_GREEN = '#16a34a';

/** Land cells use this weight so `hexAltitude` / colors can tell land from hotspot bins (weight 1–24). */
const LAND_HEX_WEIGHT = 800;
const LAND_HEX_WEIGHT_THRESHOLD = 400;

type PointRow = { lat: number; lng: number; label: string; kind: 'visitor' | 'order' };
type ArcRow = { startLat: number; startLng: number; endLat: number; endLng: number; color: string | string[] };
type Weighted = { lat: number; lng: number; w: number };

const MSG_IN = 'fsbw-admin-globe';
const MSG_POINT = 'fsbw-admin-globe-point';
const MSG_READY = 'fsbw-admin-globe-ready';

/** Merged land hex top: translucent mint → sky by latitude (reference-style). */
function landHexTopRgba(lat: number): string {
  const t = Math.max(0, Math.min(1, (lat + 10) / 70));
  const mint = { r: 110, g: 231, b: 183 };
  const sky = { r: 125, g: 211, b: 252 };
  const r = Math.round(mint.r + (sky.r - mint.r) * t);
  const g = Math.round(mint.g + (sky.g - mint.g) * t);
  const b = Math.round(mint.b + (sky.b - mint.b) * t);
  const a = 0.62 + t * 0.28;
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

function landHexSideRgba(lat: number): string {
  const t = Math.max(0, Math.min(1, (lat + 10) / 70));
  const mint = { r: 74, g: 200, b: 160 };
  const sky = { r: 56, g: 170, b: 220 };
  const r = Math.round(mint.r + (sky.r - mint.r) * t);
  const g = Math.round(mint.g + (sky.g - mint.g) * t);
  const b = Math.round(mint.b + (sky.b - mint.b) * t);
  const a = 0.72 + t * 0.2;
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

/**
 * Uniform **light translucent gray** base sphere (`globeImageUrl`).
 * Continents = **merged H3 hex mesh** (`hexBinMerge`), not scattered points.
 */
function makeOceanSolidLightGrayDataUrl(): string {
  const canvas = document.createElement('canvas');
  const sz = 64;
  canvas.width = sz;
  canvas.height = sz;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context');
  ctx.fillStyle = 'rgba(252, 252, 253, 0.14)';
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

type HexBin = { sumWeight?: number; points?: Array<{ lat?: number }> };

function binCenterLat(bin: HexBin): number {
  const p = bin.points?.[0];
  return typeof p?.lat === 'number' ? p.lat : 0;
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

const OCEAN_BASE_DATA_URL = makeOceanSolidLightGrayDataUrl();

const globe = new Globe(root, {
  rendererConfig: { alpha: true, antialias: false, powerPreference: 'low-power' },
  waitForGlobeReady: true,
})
  .backgroundColor('rgba(0,0,0,0)')
  .globeImageUrl(OCEAN_BASE_DATA_URL)
  .showGlobe(true)
  .showGraticules(false)
  .showAtmosphere(true)
  .atmosphereColor('rgba(148, 163, 184, 0.28)')
  .atmosphereAltitude(0.1)
  /** Continent mesh: H3 hex bins merged into one honeycomb surface (reference). */
  .hexBinPointsData([])
  .hexBinPointLat('lat')
  .hexBinPointLng('lng')
  .hexBinPointWeight('w')
  .hexBinResolution(3.55)
  .hexMargin(0.04)
  .hexAltitude((bin: HexBin) => {
    const w = bin.sumWeight || 0;
    if (w >= LAND_HEX_WEIGHT_THRESHOLD) return 0.0058;
    if (w < 3) return 0.001;
    return 0.022 + Math.min(0.14, Math.sqrt(w) * 0.021);
  })
  .hexTopColor((bin: HexBin) => {
    const w = bin.sumWeight || 0;
    if (w >= LAND_HEX_WEIGHT_THRESHOLD) return landHexTopRgba(binCenterLat(bin));
    return 'rgba(51, 65, 85, 0.78)';
  })
  .hexSideColor((bin: HexBin) => {
    const w = bin.sumWeight || 0;
    if (w >= LAND_HEX_WEIGHT_THRESHOLD) return landHexSideRgba(binCenterLat(bin));
    return 'rgba(30, 41, 59, 0.85)';
  })
  .hexBinMerge(true)
  .hexTransitionDuration(400)
  .pointLat('lat')
  .pointLng('lng')
  .pointColor((d: object) => ((d as PointRow).kind === 'visitor' ? BRAND_RED : ORDER_GREEN))
  .pointAltitude(0.038)
  .pointRadius(0.52)
  .pointResolution(12)
  .arcStartLat('startLat')
  .arcStartLng('startLng')
  .arcEndLat('endLat')
  .arcEndLng('endLng')
  .arcColor('color')
  .arcAltitude(0.16)
  .arcStroke(0.38)
  .arcDashLength(0.32)
  .arcDashGap(1.6)
  .arcDashAnimateTime(11000)
  .onGlobeReady(() => {
    try {
      const m = globe.globeMaterial() as {
        transparent?: boolean;
        opacity?: number;
        depthWrite?: boolean;
        needsUpdate?: boolean;
      };
      if (!m) return;
      m.transparent = true;
      m.opacity = 0.28;
      m.depthWrite = false;
      m.needsUpdate = true;
    } catch {
      /* optional */
    }
  });

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
  const pr = p as PointRow;
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

let landHexPoints: Weighted[] = [];
let lastRows: PointRow[] = [];

function applyPayload(rows: PointRow[]) {
  lastRows = rows;
  const { visitors, orders } = splitPoints(rows);
  const all: PointRow[] = [...visitors, ...orders];
  const hot = buildHotBinJitter(all);
  globe.hexBinPointsData([...landHexPoints, ...hot]).pointsData(all).arcsData(buildArcs(visitors, orders));
}

globe.pointsData([]).hexBinPointsData([]).arcsData([]);

void (async () => {
  try {
    const samples = await loadLandSamplesForGlobe(38_000, '/ne_110m_land.geojson');
    landHexPoints = samples.map((s) => ({ lat: s.lat, lng: s.lng, w: LAND_HEX_WEIGHT }));
  } catch {
    landHexPoints = [];
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
