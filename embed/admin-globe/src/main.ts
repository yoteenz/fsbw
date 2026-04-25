import Globe from 'globe.gl';
import { loadLandSamplesForGlobe } from '@fsbw/adminGlobeNe110mLand';
import { loadCountryAndStateBoundaryPathsSplit, type LatLngPair } from '@fsbw/adminGlobeBoundaryPaths';
import { orderPlaceFieldsFromGlobeLabel, visitorPlaceFieldsFromHeartbeatLabel } from '@fsbw/adminGlobePlaceLabel';

const BRAND_RED = '#EB1C24';
const ORDER_GREEN = '#16a34a';

/** Land cells use this weight so `hexAltitude` / colors can tell land from hotspot bins (weight 1–24). */
const LAND_HEX_WEIGHT = 800;
const LAND_HEX_WEIGHT_THRESHOLD = 400;

type PointRow = {
  lat: number;
  lng: number;
  label: string;
  kind: 'visitor' | 'order';
  /** Map line when zoomed in (city, region, country). */
  placeLine?: string;
  placeDetail?: string;
};

type MapLabelRow = {
  lat: number;
  lng: number;
  text: string;
  color: string;
  altitude: number;
  size: number;
  includeDot: boolean;
};
type ArcRow = { startLat: number; startLng: number; endLat: number; endLng: number; color: string | string[] };
type Weighted = { lat: number; lng: number; w: number };

/** Natural Earth boundary segment → `pathsData` row (`pathStroke` = thin fat line for soft groove width). */
type BorderPathRow = {
  points: Array<[number, number]>;
  pathColor: [string, string];
  /** Slight altitude offset: states above countries (both still under land hex tops). */
  z: 'country' | 'state';
};

/** Visible border/region lines on top of land hex (default layer order); high-contrast slate gradient. */
const BORDER_COUNTRY_GRADIENT: [string, string] = ['rgba(51, 65, 85, 0.92)', 'rgba(148, 163, 184, 0.88)'];
const BORDER_STATE_GRADIENT: [string, string] = ['rgba(71, 85, 105, 0.88)', 'rgba(100, 116, 139, 0.78)'];

const MSG_IN = 'fsbw-admin-globe';
const MSG_POINT = 'fsbw-admin-globe-point';
const MSG_READY = 'fsbw-admin-globe-ready';

/** Double-tap / double-click recenters on **Tennessee, USA** (Nashville area). */
const HOME_LAT = 36.165;
const HOME_LNG = -86.783;
const HOME_ALTITUDE = 1.35;
const RECENTER_MS = 900;
const DOUBLE_TAP_MS = 420;

/**
 * `globe.pointOfView().altitude` = camera distance / **GLOBE_RADIUS** − 1 (three-globe), but zoom events
 * do not always refresh it before our handler runs — use **camera distance** for reliable gating.
 */
const GLOBE_RADIUS = 100;
/**
 * Show labels when “zoomed in” (globe.gl `altitude` = camera distance / globeRadius − 1).
 * Use **min(camera, pointOfView)** — some builds lag one of the two on `controls` `change`.
 */
const ZOOM_LABEL_MAX_ALTITUDE = 2.65;
/** Extra-close zoom: larger label text. */
const ZOOM_LABEL_LARGE_MAX_ALTITUDE = 1.12;

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

/**
 * Scatter points around each visitor/order for tall **hex** hotspot pillars.
 * Cost is **O(n × samples)** — many markers (e.g. mock globe QA) × 24 was enough to stutter mobile WebGL.
 */
function buildHotBinJitter(rows: PointRow[], samplesPerRow: number): Weighted[] {
  const n = Math.max(2, Math.min(20, Math.round(samplesPerRow)));
  const pts: Weighted[] = [];
  for (const r of rows) {
    for (let k = 0; k < n; k++) {
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

function segmentLengthDeg(a: LatLngPair, b: LatLngPair): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/**
 * Split a polyline into many two-point rows so each segment gets its own **vertex gradient**
 * (three-globe only interpolates colors along segment count when `pathStroke` is null).
 */
function polylineToGradientSegmentRows(
  pts: LatLngPair[],
  maxSegDeg: number,
  pathColor: [string, string],
  z: BorderPathRow['z']
): BorderPathRow[] {
  if (pts.length < 2) return [];
  const rows: BorderPathRow[] = [];
  let prev = pts[0];
  if (!prev) return [];
  for (let i = 1; i < pts.length; i++) {
    const cur = pts[i];
    if (!cur) continue;
    const d = segmentLengthDeg(prev, cur);
    if (d <= maxSegDeg + 1e-9) {
      rows.push({ points: [prev, cur], pathColor, z });
      prev = cur;
      continue;
    }
    const n = Math.max(1, Math.ceil(d / maxSegDeg));
    let p0 = prev;
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      const p1: LatLngPair = [prev[0] + (cur[0] - prev[0]) * t, prev[1] + (cur[1] - prev[1]) * t];
      rows.push({ points: [p0, p1], pathColor, z });
      p0 = p1;
    }
    prev = cur;
  }
  return rows;
}

function pathsToBorderRows(
  paths: LatLngPair[][],
  maxSegDeg: number,
  pathColor: [string, string],
  z: BorderPathRow['z']
): BorderPathRow[] {
  const out: BorderPathRow[] = [];
  for (const p of paths) {
    out.push(...polylineToGradientSegmentRows(p, maxSegDeg, pathColor, z));
  }
  return out;
}

type ThreeSceneLike = {
  children: Array<{ traverse: (cb: (o: { __globeObjType?: string }) => void) => void }>;
  remove: (o: unknown) => void;
  add: (o: unknown) => void;
};

function cameraAltitudeFromDistance(): number {
  try {
    const cam = globe.camera() as { position?: { x: number; y: number; z: number } };
    const p = cam.position;
    if (!p) return 999;
    const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
    return dist / GLOBE_RADIUS - 1;
  } catch {
    return 999;
  }
}

function effectiveCameraAltitude(): number {
  const fromCam = cameraAltitudeFromDistance();
  let fromPov = 999;
  try {
    const pov = globe.pointOfView();
    const a = pov?.altitude;
    if (typeof a === 'number' && Number.isFinite(a)) fromPov = a;
  } catch {
    /* optional */
  }
  return Math.min(fromCam, fromPov);
}

/** Ensure text labels render after merged hex (some builds / rebinds can change child order). */
function reorderGlobeLabelsAboveHex(): void {
  try {
    const scene = globe.scene() as unknown as ThreeSceneLike;
    if (!scene?.children?.length) return;
    const findRoot = (t: string): unknown | null => {
      for (const top of scene.children) {
        let hit = false;
        top.traverse((o) => {
          if ((o as { __globeObjType?: string }).__globeObjType === t) hit = true;
        });
        if (hit) return top;
      }
      return null;
    };
    const hexRoot = findRoot('hexBinPoints');
    const labelRoot = findRoot('label');
    if (!hexRoot || !labelRoot || hexRoot === labelRoot) return;
    const ch = [...scene.children] as unknown[];
    const next = ch.filter((c) => c !== labelRoot);
    const hexAt = next.indexOf(hexRoot);
    if (hexAt < 0) return;
    next.splice(hexAt + 1, 0, labelRoot);
    while (scene.children.length) scene.remove(scene.children[0]);
    for (const c of next) scene.add(c);
  } catch {
    /* optional */
  }
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

function normalizeIncomingPoint(o: Record<string, unknown>): PointRow | null {
  const lat = Number(o.lat);
  const lng = Number(o.lng);
  const label = typeof o.label === 'string' ? o.label : '';
  const kind = o.kind === 'order' ? 'order' : 'visitor';
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  let placeLine = typeof o.placeLine === 'string' ? o.placeLine.trim() : '';
  let placeDetail = typeof o.placeDetail === 'string' ? o.placeDetail.trim() : '';
  if (!placeLine) {
    if (kind === 'visitor') {
      const v = visitorPlaceFieldsFromHeartbeatLabel(label);
      placeLine = v.placeLine;
      placeDetail = placeDetail || (v.placeDetail ?? '');
    } else {
      const v = orderPlaceFieldsFromGlobeLabel(label);
      placeLine = v.placeLine;
      placeDetail = placeDetail || (v.placeDetail ?? '');
    }
  }
  return { lat, lng, label, kind, placeLine, placeDetail };
}

function buildMapLabelsFromPoints(rows: PointRow[], largeZoom: boolean): MapLabelRow[] {
  const out: MapLabelRow[] = [];
  for (const r of rows) {
    const line = (r.placeLine ?? '').trim();
    if (!line) continue;
    const detail = (r.placeDetail ?? '').trim();
    /** `TextGeometry` does not render newline — use a single-line separator. */
    const text = detail ? `${line} · ${detail}` : line;
    out.push({
      lat: r.lat,
      lng: r.lng,
      text,
      color: 'rgba(15, 23, 42, 0.96)',
      altitude: 0.072,
      size: largeZoom ? 0.48 : 0.38,
      includeDot: false,
    });
  }
  return out;
}

function updateMapLabelsFromCamera() {
  const alt = effectiveCameraAltitude();
  const show = alt <= ZOOM_LABEL_MAX_ALTITUDE;
  const large = alt <= ZOOM_LABEL_LARGE_MAX_ALTITUDE;
  globe.labelsData(show ? buildMapLabelsFromPoints(lastRows, large) : []);
}

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
  .pathsData([])
  .pathPoints('points')
  .pathPointLat((p: [number, number]) => p[0])
  .pathPointLng((p: [number, number]) => p[1])
  /** Slightly **above** land hex tops (`~0.0058`) so borders read in front of the mesh. */
  .pathPointAlt((d: object) => ((d as BorderPathRow).z === 'state' ? 0.00635 : 0.00605))
  .pathResolution(0.48)
  .pathColor((d: object) => (d as BorderPathRow).pathColor)
  .pathStroke(0.95)
  .pathDashLength(1)
  .pathDashGap(0)
  .pathDashAnimateTime(0)
  /** Map-style place names when zoomed in (camera altitude low). */
  .labelsData([])
  .labelLat('lat')
  .labelLng('lng')
  .labelText('text')
  .labelColor('color')
  .labelAltitude('altitude')
  .labelSize('size')
  .labelIncludeDot('includeDot')
  .labelDotOrientation('bottom')
  .labelResolution(6)
  .labelsTransitionDuration(0)
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
    reorderGlobeLabelsAboveHex();
    requestAnimationFrame(() => reorderGlobeLabelsAboveHex());
    updateMapLabelsFromCamera();
  });

globe.pointOfView({ lat: 22, lng: -95, altitude: 2.2 }, 0);

globe.onZoom(() => {
  reorderGlobeLabelsAboveHex();
  updateMapLabelsFromCamera();
});

let lastRecenterAt = 0;
function recenterOnTennessee() {
  const now = Date.now();
  if (now - lastRecenterAt < 650) return;
  lastRecenterAt = now;
  try {
    globe.pointOfView({ lat: HOME_LAT, lng: HOME_LNG, altitude: HOME_ALTITUDE }, RECENTER_MS);
  } catch {
    /* optional */
  }
}

/** Touch: two quick taps on the globe surface. Mouse: double-click. */
let touchTapCount = 0;
let touchTapTimer: ReturnType<typeof setTimeout> | null = null;
root.addEventListener(
  'pointerup',
  (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    touchTapCount += 1;
    if (touchTapCount === 1) {
      if (touchTapTimer) clearTimeout(touchTapTimer);
      touchTapTimer = setTimeout(() => {
        touchTapCount = 0;
        touchTapTimer = null;
      }, DOUBLE_TAP_MS);
    } else if (touchTapCount >= 2) {
      if (touchTapTimer) clearTimeout(touchTapTimer);
      touchTapTimer = null;
      touchTapCount = 0;
      recenterOnTennessee();
    }
  },
  { passive: true }
);
root.addEventListener('dblclick', () => {
  recenterOnTennessee();
});

try {
  const c = globe.controls();
  c.autoRotate = true;
  c.autoRotateSpeed = 0.3;
  c.enableDamping = true;
  c.dampingFactor = 0.08;
  /** Allow zooming much closer than default; no hard max zoom-out cap */
  c.minDistance = 85;
  c.maxDistance = 1e6;
  c.addEventListener('change', () => {
    reorderGlobeLabelsAboveHex();
    updateMapLabelsFromCamera();
  });
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
let borderPaths: BorderPathRow[] = [];
let lastRows: PointRow[] = [];

/** Hard cap — each row is one `Line`; large counts hurt mobile WebGL. */
const MAX_BORDER_PATH_ROWS = 10_500;

function applyPayload(rows: PointRow[]) {
  lastRows = rows;
  const { visitors, orders } = splitPoints(rows);
  const all: PointRow[] = [...visitors, ...orders];
  /** Fewer jitter samples per marker when there are many markers (keeps merged hex bin count ~flat). */
  const jitterPerRow = Math.max(4, Math.min(14, Math.floor(220 / Math.max(1, all.length))));
  const hot = buildHotBinJitter(all, jitterPerRow);
  globe
    .hexBinPointsData([...landHexPoints, ...hot])
    .pathsData(borderPaths)
    .pointsData(all)
    .arcsData(buildArcs(visitors, orders));
  updateMapLabelsFromCamera();
}

globe.pointsData([]).hexBinPointsData([]).pathsData([]).arcsData([]).labelsData([]);

void (async () => {
  try {
    const [samples, split] = await Promise.all([
      loadLandSamplesForGlobe(38_000, '/ne_110m_land.geojson'),
      loadCountryAndStateBoundaryPathsSplit(380, 1200),
    ]);
    landHexPoints = samples.map((s) => ({ lat: s.lat, lng: s.lng, w: LAND_HEX_WEIGHT }));
    const countryRows = pathsToBorderRows(split.countries, 1.15, BORDER_COUNTRY_GRADIENT, 'country');
    const stateRows = pathsToBorderRows(split.states, 0.82, BORDER_STATE_GRADIENT, 'state');
    /** Prefer keeping internal state/province segments if we must cap (WebGL budget). */
    const stateCap = Math.min(stateRows.length, Math.floor(MAX_BORDER_PATH_ROWS * 0.62));
    const statesTrimmed = stateRows.slice(0, stateCap);
    const countryBudget = MAX_BORDER_PATH_ROWS - statesTrimmed.length;
    const countriesTrimmed = countryRows.slice(0, Math.max(0, countryBudget));
    borderPaths = [...countriesTrimmed, ...statesTrimmed];
  } catch {
    landHexPoints = [];
    borderPaths = [];
  }
  applyPayload(lastRows);
  reorderGlobeLabelsAboveHex();
  requestAnimationFrame(() => {
    reorderGlobeLabelsAboveHex();
    notifyReady();
  });
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
    const row = normalizeIncomingPoint(r as Record<string, unknown>);
    if (row) cleaned.push(row);
  }
  applyPayload(cleaned);
  reorderGlobeLabelsAboveHex();
});

function notifyReady() {
  window.parent.postMessage({ type: MSG_READY }, '*');
}
