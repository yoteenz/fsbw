import Globe from 'globe.gl';
import { Group, type Mesh } from 'three';
import { loadLandSamplesForGlobe } from '@fsbw/adminGlobeNe110mLand';
import { loadCountryAndStateBoundaryPathsSplit, type LatLngPair } from '@fsbw/adminGlobeBoundaryPaths';
import { orderPlaceFieldsFromGlobeLabel, visitorPlaceFieldsFromHeartbeatLabel } from '@fsbw/adminGlobePlaceLabel';
import { landmarkForGeographicText } from '@fsbw/adminGlobeGeographicLandmark';
import { buildHexPrismMesh, ORDER_PRISM_H3_RES } from './orderPrismLayer';

const BRAND_RED = '#EB1C24';

/**
 * Bottom of the order/view stack sits on the **same** band as land H3 tops (`hexAltitude` ~0.0058)
 * so **one** order is a **flat** colored disk on the surface; each extra count adds **`POINT_STACK_STEP`**.
 */
const STACK_SURFACE_ALT = 0.00585;
/** One “pill” layer per order or per view stacked above **`STACK_SURFACE_ALT`**. */
const POINT_STACK_STEP = 0.00135;
/** Postcard floats slightly above the top stack layer. */
const POSTCARD_ABOVE_STACK = 0.0038;

/** Admin UI copy: match storefront uppercase label style (Futura + all-caps). */
function displayUpper(s: string): string {
  return s.trim().toLocaleUpperCase('en-US');
}

/** Land cells use this weight so `hexAltitude` / colors can tell land from hotspot bins (weight 1–24). */
const LAND_HEX_WEIGHT = 800;
const LAND_HEX_WEIGHT_THRESHOLD = 400;

type ClusterCustomer = {
  email: string;
  orderCount: number;
  totalSpent: number;
  /** Most recent unit (see main app `adminOrderGlobeClusters`). */
  recentUnitName: string;
  recentUnitCapSize?: string;
  /** @deprecated — use `recentUnitName` */
  topProduct?: string;
  topProductCapSize?: string;
  displayName?: string;
  profileImageUrl?: string;
  age?: number | null;
};

type PostcardMode = 'order' | 'visitor';

type PointRow = {
  lat: number;
  lng: number;
  label: string;
  kind: 'visitor' | 'order';
  /** Map line when zoomed in (city, region, country). */
  placeLine?: string;
  placeDetail?: string;
  /** Order cluster: stable key + customers (from parent JSON). */
  clusterKey?: string;
  orderCount?: number;
  /** Postcard: known-for title + symbol (order clusters + standalone visitors from parent). */
  landmarkTitle?: string;
  landmarkSymbol?: string;
  orderTowerHeight?: number;
  clusterCustomers?: ClusterCustomer[];
  /**
   * Per-marker altitude (globe radius units) for **stacked** order/visitor points.
   * Filled in **`applyPayload`**; `pointAltitude` reads this field.
   */
  alt?: number;
  /** One HTML postcard per city for standalone visitors (dedupe). */
  postcardKey?: string;
  postcardMode?: PostcardMode;
  /** Per-layer prism: bottom/top relative altitude (globe radius units). */
  sliceBottomAlt?: number;
  sliceTopAlt?: number;
};

type ArcRow = { startLat: number; startLng: number; endLat: number; endLng: number; color: string | string[] };
type Weighted = { lat: number; lng: number; w: number };
type HtmlLandmarkRow = { lat: number; lng: number; alt: number; row: PointRow };

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
const MSG_CLUSTER = 'fsbw-admin-globe-cluster';
const MSG_POV = 'fsbw-admin-globe-pov';
const MSG_READY = 'fsbw-admin-globe-ready';
/** Parent → iframe: pause globe auto-rotate while order cluster panel is open. */
const MSG_UI_CLUSTER_PANEL = 'fsbw-admin-globe-ui-cluster-panel';

/** Double-tap / double-click + initial view: **Memphis, TN, USA**. */
const HOME_LAT = 35.1495;
const HOME_LNG = -90.049;
const HOME_ALTITUDE = 1.35;
const RECENTER_MS = 900;
const DOUBLE_TAP_MS = 420;
/** After tapping an **order cluster** dot, animate here so labels + holographic panel band is active (`large` zoom). */
const CLUSTER_FOCUS_ALTITUDE = 0.38;

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
 * Legacy: random jitter for hex **hot** bins. Not used for visitor counts (see **stacked** markers in **`applyPayload`**).
 */
/**
 * **Hot** hex bins: legacy; visitor volume is now **stacked** markers, not extra bins here.
 */
function buildHotBinJitterForHexBins(_rows: PointRow[], _samplesPerRow: number): Weighted[] {
  return [];
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

/** Great-circle distance in km (for “views near this cluster” counts). */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Visitor dots within **maxKm** of the order cluster (same payload as the globe). */
function countVisitorViewsNear(visitors: PointRow[], lat: number, lng: number, maxKm = 100): number {
  let n = 0;
  for (const v of visitors) {
    if (haversineKm(lat, lng, v.lat, v.lng) <= maxKm) n += 1;
  }
  return n;
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

/** Ensure **HTML landmarks** render after merged hex (place **TextGeometry** labels disabled). */
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
    const customRoot = findRoot('custom');
    const labelRoot = findRoot('label');
    const htmlRoot = findRoot('html');
    if (!hexRoot) return;
    const ch = [...scene.children] as unknown[];
    let next = ch.filter((c) => c !== labelRoot && c !== htmlRoot);
    const hexAt = next.indexOf(hexRoot);
    if (hexAt < 0) return;
    let insertAt = hexAt + 1;
    if (customRoot && !next.includes(customRoot)) {
      next.splice(insertAt, 0, customRoot);
      insertAt += 1;
    }
    if (labelRoot) {
      next.splice(insertAt, 0, labelRoot);
      insertAt += 1;
    }
    if (htmlRoot) {
      next.splice(insertAt, 0, htmlRoot);
    }
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
  const rw = Math.max(120, Math.round(r.width || root.clientWidth || 300));
  const rh = Math.max(120, Math.round(r.height || root.clientHeight || 240));
  /** Globe.gl expects a **square** canvas; unequal w/h makes the sphere look oval when zoomed. */
  const side = Math.min(rw, rh);
  return { w: side, h: side };
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
  const clusterKey = typeof o.clusterKey === 'string' ? o.clusterKey.trim() : undefined;
  const orderCount = typeof o.orderCount === 'number' && Number.isFinite(o.orderCount) ? o.orderCount : undefined;
  const landmarkTitle = typeof o.landmarkTitle === 'string' ? o.landmarkTitle.trim() : undefined;
  const landmarkSymbol = typeof o.landmarkSymbol === 'string' ? o.landmarkSymbol.trim() : undefined;
  const orderTowerHeight =
    typeof o.orderTowerHeight === 'number' && Number.isFinite(o.orderTowerHeight)
      ? o.orderTowerHeight
      : typeof o.towerHeight === 'number' && Number.isFinite(o.towerHeight)
        ? o.towerHeight
        : undefined;
  let clusterCustomers: ClusterCustomer[] | undefined;
  if (Array.isArray(o.clusterCustomers)) {
    const rows: ClusterCustomer[] = [];
    for (const c of o.clusterCustomers) {
      if (!c || typeof c !== 'object') continue;
      const r = c as Record<string, unknown>;
      const email = typeof r.email === 'string' ? r.email.trim() : '';
      const oc = Number(r.orderCount);
      const ts = Number(r.totalSpent);
      const rName =
        typeof r.recentUnitName === 'string' && r.recentUnitName.trim()
          ? r.recentUnitName.trim()
          : typeof r.topProduct === 'string' && r.topProduct.trim()
            ? r.topProduct.trim()
            : '—';
      const tpc =
        typeof r.recentUnitCapSize === 'string' && r.recentUnitCapSize.trim()
          ? r.recentUnitCapSize.trim()
          : typeof r.topProductCapSize === 'string' && r.topProductCapSize.trim()
            ? r.topProductCapSize.trim()
            : undefined;
      const dn = typeof r.displayName === 'string' ? r.displayName.trim() : '';
      const pi = typeof r.profileImageUrl === 'string' ? r.profileImageUrl.trim() : '';
      const ageRaw = r.age;
      const ageParsed =
        typeof ageRaw === 'number' && Number.isFinite(ageRaw)
          ? ageRaw
          : typeof ageRaw === 'string' && String(ageRaw).trim()
            ? parseInt(String(ageRaw), 10)
            : NaN;
      if (!email) continue;
      rows.push({
        email,
        orderCount: Number.isFinite(oc) ? oc : 0,
        totalSpent: Number.isFinite(ts) ? ts : 0,
        recentUnitName: rName || '—',
        ...(tpc ? { recentUnitCapSize: tpc } : {}),
        ...(dn ? { displayName: dn } : {}),
        ...(pi ? { profileImageUrl: pi } : {}),
        ...(Number.isFinite(ageParsed) ? { age: ageParsed } : {}),
      });
    }
    if (rows.length) clusterCustomers = rows;
  }
  const postcardKey = typeof o.postcardKey === 'string' ? o.postcardKey.trim() : undefined;
  const pm = o.postcardMode === 'visitor' ? 'visitor' : o.postcardMode === 'order' ? 'order' : undefined;
  return {
    lat,
    lng,
    label,
    kind,
    placeLine,
    placeDetail,
    clusterKey,
    orderCount,
    landmarkTitle,
    landmarkSymbol,
    orderTowerHeight,
    clusterCustomers,
    ...(postcardKey ? { postcardKey } : {}),
    ...(pm ? { postcardMode: pm } : {}),
  };
}

/**
 * Reconstruct **one** order-cluster row (embed expands payload to one point per order/view).
 * Used for postcard + **`activateOrderCluster`**.
 */
function clusterOrderRowsFromRaw(raw: PointRow[]): PointRow[] {
  const m = new Map<string, PointRow>();
  for (const r of raw) {
    if (r.kind !== 'order' || !r.clusterKey) continue;
    if (!m.has(r.clusterKey)) m.set(r.clusterKey, { ...r });
  }
  return [...m.values()];
}

function landmarkFromRow(r: PointRow, mode: PostcardMode): { title: string; symbol: string } {
  const t = typeof r.landmarkTitle === 'string' ? r.landmarkTitle.trim() : '';
  const s = typeof r.landmarkSymbol === 'string' ? r.landmarkSymbol.trim() : '';
  if (t && s) return { title: t, symbol: s };
  const blob = [r.clusterKey, r.placeLine, r.label].filter(Boolean).join(' ');
  return landmarkForGeographicText(blob, mode);
}

/**
 * **One** postcard per order cluster (green) and per **standalone-visitor** site (red), **above** the pillar stack.
 */
function postcardRowsForCamera(raw: PointRow[]): HtmlLandmarkRow[] {
  const v = splitPoints(raw).visitors;
  const clusterBases = clusterOrderRowsFromRaw(raw);
  const out: HtmlLandmarkRow[] = [];
  for (const c of clusterBases) {
    const oCount = Math.max(0, Math.floor(Number(c.orderCount) || 0));
    const vCount = Math.max(0, Math.floor(countVisitorViewsNear(v, c.lat, c.lng, 100)));
    const stackH = oCount + vCount;
    const topAlt =
      stackH > 0 ? STACK_SURFACE_ALT + (stackH - 1) * POINT_STACK_STEP : STACK_SURFACE_ALT;
    const { title, symbol } = landmarkFromRow(c, 'order');
    out.push({
      lat: c.lat,
      lng: c.lng,
      alt: topAlt + POSTCARD_ABOVE_STACK,
      row: {
        ...c,
        kind: 'order',
        landmarkTitle: title,
        landmarkSymbol: symbol,
        postcardMode: 'order',
      },
    });
  }
  const byStandKey = new Map<string, PointRow>();
  for (const p of v) {
    if (p.clusterKey) continue;
    const k = (p.postcardKey && p.postcardKey.trim()) || `${p.lat.toFixed(2)}|${p.lng.toFixed(2)}`;
    if (!byStandKey.has(k)) byStandKey.set(k, p);
  }
  for (const p of byStandKey.values()) {
    const { title, symbol } = landmarkFromRow(p, 'visitor');
    out.push({
      lat: p.lat,
      lng: p.lng,
      alt: (p.alt ?? STACK_SURFACE_ALT) + POSTCARD_ABOVE_STACK,
      row: {
        ...p,
        kind: 'visitor',
        landmarkTitle: title,
        landmarkSymbol: symbol,
        postcardMode: 'visitor',
        placeDetail: p.placeDetail,
      },
    });
  }
  return out;
}

/**
 * `three-render-objects` sets the **CSS2D** overlay to **`pointer-events: none`** so the canvas gets drags.
 * We only enable **`pointer-events: auto`** on **landmark buttons** (`[data-fsbw-landmark]`). If the **whole**
 * overlay is `auto`, it sits above the canvas and **eats pointerdown** — OrbitControls never starts a drag and
 * can end up **stuck** after the parent cluster panel closes (lost `pointerup` on canvas).
 */
function enableCss2dLandmarkPointerHitThrough(): void {
  try {
    const canvas = globe.renderer()?.domElement as HTMLElement | undefined;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    for (let i = 0; i < container.children.length; i++) {
      const el = container.children[i] as HTMLElement | undefined;
      if (!el || el === canvas) continue;
      if (el.tagName === 'CANVAS') continue;
      el.style.pointerEvents = 'none';
      el.querySelectorAll<HTMLElement>('[data-fsbw-landmark="1"]').forEach((btn) => {
        btn.style.pointerEvents = 'auto';
      });
    }
  } catch {
    /* optional */
  }
}

type OrbitControlsLike = {
  enabled?: boolean;
  disconnect?: () => void;
  connect?: (el: HTMLElement) => void;
};

/** After UI overlays (parent cluster panel), OrbitControls can miss **`pointerup`** on the canvas — reconnect. */
function recoverOrbitPointerState(): void {
  try {
    const c = globe.controls() as OrbitControlsLike;
    const canvas = globe.renderer()?.domElement as HTMLElement | undefined;
    if (!canvas || typeof c.disconnect !== 'function' || typeof c.connect !== 'function') return;
    c.disconnect();
    c.connect(canvas);
    if (typeof c.enabled === 'boolean') c.enabled = true;
  } catch {
    /* optional */
  }
}

let autoRotateWhenIdle = true;
/** Parent order-cluster panel is open — keep **`autoRotate` false**; globe.gl can reset it on data/zoom updates. */
let parentClusterPanelOpen = false;

let autoRotateRafId: number | null = null;

function setGlobeAutoRotateForClusterPanel(open: boolean): void {
  parentClusterPanelOpen = open;
  if (autoRotateRafId != null) {
    cancelAnimationFrame(autoRotateRafId);
    autoRotateRafId = null;
  }
  try {
    const c = globe.controls();
    if (open) {
      c.autoRotate = false;
      c.autoRotateSpeed = 0;
      autoRotateRafId = requestAnimationFrame(armAutoRotateOffWhileClusterPanelOpen);
    } else {
      c.autoRotateSpeed = 0.3;
      c.autoRotate = autoRotateWhenIdle;
      recoverOrbitPointerState();
    }
  } catch {
    /* optional */
  }
}

function enforceAutoRotateWhenClusterPanelOpen(): void {
  if (!parentClusterPanelOpen) return;
  try {
    const c = globe.controls();
    c.autoRotate = false;
    /** globe.gl / three often reset **`autoRotate`** after **`width`/`height`**, **`pointOfView`**, or layer rebuilds — re-assert each frame while panel open. */
    c.autoRotateSpeed = 0;
  } catch {
    /* optional */
  }
}

/** While the parent cluster panel is open, keep forcing **`autoRotate` off** (globe.gl overwrites it). */
function armAutoRotateOffWhileClusterPanelOpen(): void {
  if (!parentClusterPanelOpen) {
    autoRotateRafId = null;
    return;
  }
  enforceAutoRotateWhenClusterPanelOpen();
  autoRotateRafId = requestAnimationFrame(armAutoRotateOffWhileClusterPanelOpen);
}

function orderClusterBaseRowFromPayload(clusterKey: string | undefined): PointRow | null {
  if (!clusterKey) return null;
  for (const p of lastRows) {
    if (p.clusterKey === clusterKey && p.kind === 'order') return p;
  }
  return null;
}

function resolveClusterSourceRow(p: PointRow): PointRow {
  if (p.kind === 'order' && p.clusterKey) return p;
  return orderClusterBaseRowFromPayload(p.clusterKey) || p;
}

function activateOrderCluster(row: PointRow): void {
  const target = window.parent && window.parent !== window ? window.parent : null;
  if (!target) return;
  setGlobeAutoRotateForClusterPanel(true);
  const { visitors } = splitPoints(lastRows);
  const base = orderClusterBaseRowFromPayload(row.clusterKey) || row;
  const viewCount = countVisitorViewsNear(visitors, base.lat, base.lng);
  const totalOrders = Math.max(0, Math.floor(Number(base.orderCount) || 0));
  const customersUpper = (base.clusterCustomers ?? []).map((c) => ({
    ...c,
    recentUnitName: displayUpper(c.recentUnitName || c.topProduct || '—'),
    ...(c.recentUnitCapSize
      ? { recentUnitCapSize: displayUpper(c.recentUnitCapSize) }
      : c.topProductCapSize
        ? { topProductCapSize: displayUpper(c.topProductCapSize) }
        : {}),
  }));
  target.postMessage(
    {
      type: MSG_CLUSTER,
      clusterKey: base.clusterKey ?? '',
      placeLine: displayUpper(base.placeLine ?? ''),
      orderCount: totalOrders,
      viewCount,
      landmarkTitle: displayUpper(base.landmarkTitle ?? ''),
      landmarkSymbol: base.landmarkSymbol ?? '',
      customers: customersUpper,
    },
    '*'
  );
  lastClusterPanelZoom = true;
  clusterPanelHoldUntilLarge = true;
  if (clusterPanelHoldTimer) clearTimeout(clusterPanelHoldTimer);
  clusterPanelHoldTimer = setTimeout(() => {
    clusterPanelHoldTimer = null;
    clusterPanelHoldUntilLarge = false;
  }, 3200);
  try {
    globe.pointOfView({ lat: base.lat, lng: base.lng, altitude: CLUSTER_FOCUS_ALTITUDE }, RECENTER_MS);
  } catch {
    /* optional */
  }
  requestAnimationFrame(() => {
    updateMapLabelsFromCamera();
    reorderGlobeLabelsAboveHex();
  });
}

/** Slight tilt per cluster so chips feel like scattered postcards (stable from `clusterKey`). */
function postcardTiltDeg(seed: string | undefined): number {
  let h = 0;
  const s = seed ?? '';
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 1)) % 997;
  return ((h % 11) - 5) * 0.55;
}

/** Postcard / hand-stamp — neutral hairline (pillar color stays on the markers only). */
function buildLandmarkHtml(row: PointRow): HTMLElement {
  const wrap = document.createElement('button');
  wrap.type = 'button';
  wrap.setAttribute('data-fsbw-landmark', '1');
  const isVisitor = row.postcardMode === 'visitor';
  const sym = row.landmarkSymbol || '📍';
  const lmTitle = row.landmarkTitle || (isVisitor ? 'Local views' : 'Orders hub');
  const titleU = displayUpper(lmTitle);
  const n = row.orderCount ?? 0;
  const tilt = postcardTiltDeg(isVisitor ? (row.postcardKey ?? row.placeLine) : row.clusterKey);
  if (isVisitor) {
    wrap.title = `${titleU} — LIVE VIEWS`;
  } else {
    wrap.title = `${titleU} · ${n} ORDER${n === 1 ? '' : 'S'} — TAP FOR BREAKDOWN`;
  }
  wrap.setAttribute(
    'style',
    [
      'pointer-events:auto',
      'cursor:pointer',
      'border:none',
      'padding:0',
      'margin:0',
      'line-height:0',
      'background:transparent',
    ].join(';')
  );

  /**
   * **No** `backdrop-filter` on the shell — subtle neutral border only.
   */
  const shell = document.createElement('span');
  shell.setAttribute(
    'style',
    [
      'display:inline-flex',
      'align-items:center',
      'justify-content:center',
      'width:23px',
      'height:19px',
      'border-radius:2px',
      'position:relative',
      'overflow:visible',
      'transform:rotate(' + tilt + 'deg)',
      'background:transparent',
      'border:1px solid rgba(255,255,255,0.22)',
      'box-shadow:none',
    ].join(';')
  );

  const face = document.createElement('span');
  face.textContent = sym;
  face.setAttribute(
    'style',
    [
      'position:relative',
      'z-index:1',
      'display:inline-block',
      'font-family:ui-rounded,"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",cursive',
      'font-size:11px',
      'line-height:1',
      'letter-spacing:0.02em',
      'opacity:0.72',
      'filter:saturate(1.12) contrast(1.04)',
      'text-shadow:0 0.5px 1px rgba(15,23,42,0.12)',
    ].join(';')
  );

  shell.appendChild(face);
  wrap.appendChild(shell);

  wrap.addEventListener('pointerup', (ev: PointerEvent) => {
    if (ev.button !== 0) return;
    ev.stopPropagation();
    ev.preventDefault();
    if (isVisitor) {
      const target = window.parent && window.parent !== window ? window.parent : null;
      if (target) {
        target.postMessage(
          {
            type: MSG_POINT,
            kind: 'visitor' as const,
            label: displayUpper(row.label),
            lat: row.lat,
            lng: row.lng,
          },
          '*'
        );
      }
    } else {
      activateOrderCluster(row);
    }
  });
  return wrap;
}

function htmlLandmarkRowsForCamera(rawRows: PointRow[], show: boolean): HtmlLandmarkRow[] {
  if (!show) return [];
  return postcardRowsForCamera(rawRows);
}

let lastClusterPanelZoom = false;
/** While animating to a cluster after order-dot tap, do not send **`clusterPanel: false`** (would close the panel mid-zoom). */
let clusterPanelHoldUntilLarge = false;
let clusterPanelHoldTimer: ReturnType<typeof setTimeout> | null = null;

function clearClusterPanelHold(): void {
  clusterPanelHoldUntilLarge = false;
  if (clusterPanelHoldTimer) {
    clearTimeout(clusterPanelHoldTimer);
    clusterPanelHoldTimer = null;
  }
}

function notifyParentClusterZoom(clusterPanel: boolean): void {
  if (!clusterPanel && clusterPanelHoldUntilLarge) return;
  if (clusterPanel && clusterPanelHoldUntilLarge) clearClusterPanelHold();
  if (clusterPanel === lastClusterPanelZoom) return;
  lastClusterPanelZoom = clusterPanel;
  const target = window.parent && window.parent !== window ? window.parent : null;
  if (!target) return;
  try {
    target.postMessage({ type: MSG_POV, clusterPanel }, '*');
  } catch {
    /* optional */
  }
}

function updateMapLabelsFromCamera() {
  const alt = effectiveCameraAltitude();
  const show = alt <= ZOOM_LABEL_MAX_ALTITUDE;
  const large = alt <= ZOOM_LABEL_LARGE_MAX_ALTITUDE;
  /** No floating **placeLine** / **`TextGeometry`** labels on zoom — product request (dots + landmarks only). */
  globe.labelsData([]);
  globe.htmlElementsData(htmlLandmarkRowsForCamera(lastRows, show));
  requestAnimationFrame(() => enableCss2dLandmarkPointerHitThrough());
  enforceAutoRotateWhenClusterPanelOpen();
  /** Parent shows order cluster sheet only when zoomed in this close (same band as “large” labels). */
  notifyParentClusterZoom(large);
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
    /** Land + visitor hotspot bins share one **flat** prism height — no extruded “pillars”. */
    if (w >= LAND_HEX_WEIGHT_THRESHOLD) return 0.0058;
    return 0.00565;
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
  .pointColor((d: object) => ((d as PointRow).kind === 'visitor' ? BRAND_RED : 'rgba(0,0,0,0)'))
  .pointAltitude((d: object) => (d as PointRow).alt ?? STACK_SURFACE_ALT)
  .pointRadius((d: object) => {
    const r = d as PointRow;
    if (r.kind === 'visitor' && !r.clusterKey) return 0.52;
    return 0;
  })
  .pointResolution(12)
  .customLayerData([])
  .customThreeObject(() => new Group())
  .customThreeObjectUpdate(updateCustomPrismMesh)
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
  /** `labelsData` kept empty — no zoomed place-name **`TextGeometry`** (see **`updateMapLabelsFromCamera`**). */
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
  .htmlElementsData([])
  .htmlLat('lat')
  .htmlLng('lng')
  .htmlAltitude('alt')
  .htmlElement((d: object) => buildLandmarkHtml((d as HtmlLandmarkRow).row))
  .htmlTransitionDuration(0)
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
    enableCss2dLandmarkPointerHitThrough();
    updateMapLabelsFromCamera();
    enforceAutoRotateWhenClusterPanelOpen();
  });

globe.pointOfView({ lat: HOME_LAT, lng: HOME_LNG, altitude: 2.05 }, 0);

globe.onZoom(() => {
  reorderGlobeLabelsAboveHex();
  updateMapLabelsFromCamera();
  enforceAutoRotateWhenClusterPanelOpen();
});

let lastRecenterAt = 0;
function recenterOnMemphis() {
  const now = Date.now();
  if (now - lastRecenterAt < 650) return;
  lastRecenterAt = now;
  clearClusterPanelHold();
  try {
    globe.pointOfView({ lat: HOME_LAT, lng: HOME_LNG, altitude: HOME_ALTITUDE }, RECENTER_MS);
  } catch {
    /* optional */
  }
}

/**
 * Touch double-tap → home (TN). **Must not** treat **pinch-zoom** (two `pointerup`s in a row) as a double-tap —
 * that was firing **`recenterOnMemphis`** and animating the camera back out after zoom-in.
 */
const activeTouchPointerIds = new Set<number>();
let multiTouchGestureActive = false;
let touchTapCount = 0;
let touchTapTimer: ReturnType<typeof setTimeout> | null = null;

root.addEventListener(
  'pointerdown',
  (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    activeTouchPointerIds.add(e.pointerId);
    if (activeTouchPointerIds.size > 1) multiTouchGestureActive = true;
  },
  { passive: true }
);

root.addEventListener(
  'pointerup',
  (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    activeTouchPointerIds.delete(e.pointerId);
    if (multiTouchGestureActive) {
      if (activeTouchPointerIds.size === 0) {
        multiTouchGestureActive = false;
        touchTapCount = 0;
        if (touchTapTimer) {
          clearTimeout(touchTapTimer);
          touchTapTimer = null;
        }
      }
      return;
    }
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
      recenterOnMemphis();
    }
  },
  { passive: true }
);

root.addEventListener(
  'pointercancel',
  (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    activeTouchPointerIds.delete(e.pointerId);
    if (activeTouchPointerIds.size === 0) {
      multiTouchGestureActive = false;
      touchTapCount = 0;
      if (touchTapTimer) {
        clearTimeout(touchTapTimer);
        touchTapTimer = null;
      }
    }
  },
  { passive: true }
);
root.addEventListener('dblclick', () => {
  recenterOnMemphis();
});

try {
  const c = globe.controls();
  autoRotateWhenIdle = true;
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
    enforceAutoRotateWhenClusterPanelOpen();
  });
} catch {
  /* optional */
}

function applySize() {
  const { w, h } = readSize();
  globe.width(w).height(h);
  requestAnimationFrame(() => enableCss2dLandmarkPointerHitThrough());
  enforceAutoRotateWhenClusterPanelOpen();
}
applySize();
requestAnimationFrame(() => {
  applySize();
  requestAnimationFrame(applySize);
});

globe.onPointClick((p: object) => {
  const pr = p as PointRow;
  if (pr.clusterKey && (pr.kind === 'order' || pr.placeDetail === 'VIEW')) {
    activateOrderCluster(resolveClusterSourceRow(pr));
    return;
  }
  const target = window.parent && window.parent !== window ? window.parent : null;
  if (!target) return;
  target.postMessage(
    {
      type: MSG_POINT,
      kind: pr.kind,
      label: displayUpper(pr.label),
      lat: pr.lat,
      lng: pr.lng,
    },
    '*'
  );
});

globe.onCustomLayerClick((obj: object) => {
  const g = obj as Group & { children?: Mesh[] };
  const mesh = g.children?.[0] as Mesh | undefined;
  const row = mesh?.userData?.pointRow as PointRow | undefined;
  if (!row) return;
  if (row.clusterKey && (row.kind === 'order' || row.placeDetail === 'VIEW')) {
    activateOrderCluster(resolveClusterSourceRow(row));
  }
});

type CustomPrismRow = PointRow & { sliceBottomAlt: number; sliceTopAlt: number };

let customPrismRows: CustomPrismRow[] = [];

function updateOrderPrismsFromSlices(slices: PointRow[]): void {
  const rows: CustomPrismRow[] = [];
  for (const p of slices) {
    const b = p.sliceBottomAlt;
    const t = p.sliceTopAlt;
    if (typeof b !== 'number' || typeof t !== 'number' || !Number.isFinite(b) || !Number.isFinite(t)) continue;
    if (t <= b) continue;
    rows.push({ ...p, sliceBottomAlt: b, sliceTopAlt: t });
  }
  customPrismRows = rows;
  try {
    globe.customLayerData([...customPrismRows]);
  } catch {
    /* optional */
  }
}

function updateCustomPrismMesh(obj: import('three').Object3D, d: object, globeR?: number): void {
  const row = d as CustomPrismRow;
  const g = obj as Group;
  const R = typeof globeR === 'number' && Number.isFinite(globeR) ? globeR : 100;
  while (g.children.length) {
    const ch = g.children[0] as Mesh;
    ch.geometry?.dispose();
    g.remove(ch);
  }
  const mesh = buildHexPrismMesh(
    row.lat,
    row.lng,
    row.sliceBottomAlt,
    row.sliceTopAlt,
    R,
    ORDER_PRISM_H3_RES,
    row.placeDetail === 'VIEW' || row.kind === 'visitor'
  );
  mesh.userData.pointRow = row;
  g.add(mesh);
}

let landHexPoints: Weighted[] = [];
let borderPaths: BorderPathRow[] = [];
let lastRows: PointRow[] = [];

/** Hard cap — each row is one `Line`; large counts hurt mobile WebGL. */
const MAX_BORDER_PATH_ROWS = 10_500;

function applyPayload(rows: PointRow[]) {
  lastRows = rows;
  const { visitors, orders } = splitPoints(rows);

  /** One row per **order** cluster (same `clusterKey` can be duplicated in payload). */
  const byCluster = new Map<string, PointRow>();
  for (const o of orders) {
    if (o.kind === 'order' && o.clusterKey) {
      const k = o.clusterKey.trim();
      if (!k) continue;
      if (!byCluster.has(k)) byCluster.set(k, o);
    }
  }
  const clusterList = [...byCluster.values()];

  const isNearOrderCluster = (lat: number, lng: number, maxKm: number) => {
    for (const c of clusterList) {
      if (haversineKm(lat, lng, c.lat, c.lng) <= maxKm) return true;
    }
    return false;
  };

  const prismSlices: PointRow[] = [];
  for (const c of clusterList) {
    const oCount = Math.max(0, Math.floor(Number(c.orderCount) || 0));
    for (let i = 0; i < oCount; i++) {
      const bottom = STACK_SURFACE_ALT + i * POINT_STACK_STEP;
      const top = bottom + POINT_STACK_STEP;
      prismSlices.push({
        ...c,
        orderCount: oCount,
        orderTowerHeight: bottom,
        alt: bottom,
        sliceBottomAlt: bottom,
        sliceTopAlt: top,
      });
    }
    const viewN = countVisitorViewsNear(visitors, c.lat, c.lng, 100);
    const vCount = Math.max(0, Math.floor(viewN));
    for (let j = 0; j < vCount; j++) {
      const bottom = STACK_SURFACE_ALT + (oCount + j) * POINT_STACK_STEP;
      const top = bottom + POINT_STACK_STEP;
      prismSlices.push({
        ...c,
        kind: 'visitor' as const,
        label: `VIEW · ${(c.placeLine || c.label).slice(0, 64)}`,
        placeDetail: 'VIEW',
        orderCount: 0,
        orderTowerHeight: bottom,
        alt: bottom,
        sliceBottomAlt: bottom,
        sliceTopAlt: top,
      });
    }
  }

  const standaloneVisitors: PointRow[] = [];
  for (const v of visitors) {
    if (isNearOrderCluster(v.lat, v.lng, 5)) continue;
    standaloneVisitors.push({ ...v, alt: STACK_SURFACE_ALT, orderTowerHeight: STACK_SURFACE_ALT });
  }

  updateOrderPrismsFromSlices(prismSlices);
  /** Land mesh; **H3 hex prisms** for orders/views; red dots for standalone visitors only. */
  globe
    .hexBinPointsData([...landHexPoints, ...buildHotBinJitterForHexBins(visitors, 0)])
    .pathsData(borderPaths)
    .pointsData(standaloneVisitors)
    .arcsData(buildArcs(standaloneVisitors, clusterList));
  updateMapLabelsFromCamera();
  enforceAutoRotateWhenClusterPanelOpen();
}

globe.pointsData([]).hexBinPointsData([]).pathsData([]).arcsData([]).labelsData([]).htmlElementsData([]).customLayerData([]);

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
  enforceAutoRotateWhenClusterPanelOpen();
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
  if (!d || typeof d !== 'object') return;
  if (d.type === MSG_UI_CLUSTER_PANEL) {
    const open = Boolean(d.open);
    setGlobeAutoRotateForClusterPanel(open);
    if (!open) {
      requestAnimationFrame(() => {
        enableCss2dLandmarkPointerHitThrough();
        recoverOrbitPointerState();
      });
    }
    return;
  }
  if (d.type !== MSG_IN) return;
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
