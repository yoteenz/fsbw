import { useMemo, useState, useCallback, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { loadLandSamplesForGlobe } from '../../utils/adminGlobeNe110mLand';
import { loadCountryAndStateBoundaryPathsSplit } from '../../utils/adminGlobeBoundaryPaths';
import { orderPlaceFieldsFromGlobeLabel, visitorPlaceFieldsFromHeartbeatLabel } from '../../utils/adminGlobePlaceLabel';
import { enrichOrderGlobeClusterCustomers } from '../../utils/adminGlobeClusterClientProfile';

const BRAND_RED = '#EB1C24';
const ORDER_GREEN = '#16a34a';

/** Protocol with `embed/admin-globe/src/main.ts` */
const MSG_IN = 'fsbw-admin-globe';
const MSG_POINT = 'fsbw-admin-globe-point';
const MSG_CLUSTER = 'fsbw-admin-globe-cluster';
const MSG_POV = 'fsbw-admin-globe-pov';
const MSG_READY = 'fsbw-admin-globe-ready';
/** Parent → iframe: pause auto-rotate while cluster panel is open. */
const MSG_UI_CLUSTER_PANEL = 'fsbw-admin-globe-ui-cluster-panel';

export type GlobeClusterCustomerRow = {
  email: string;
  orderCount: number;
  totalSpent: number;
  topProduct: string;
  displayName?: string;
  profileImageUrl?: string;
  age?: number | null;
};

export type LiveGlobePoint = {
  lat: number;
  lng: number;
  label: string;
  kind: 'visitor' | 'order';
  placeLine?: string;
  placeDetail?: string;
  clusterKey?: string;
  orderCount?: number;
  landmarkTitle?: string;
  landmarkSymbol?: string;
  orderTowerHeight?: number;
  clusterCustomers?: GlobeClusterCustomerRow[];
};

export type GlobeOrderClusterDetail = {
  clusterKey: string;
  placeLine: string;
  orderCount: number;
  /** Live visitors counted near this cluster on the globe (embed: within ~100km of cluster lat/lng). */
  viewCount: number;
  landmarkTitle: string;
  landmarkSymbol: string;
  customers: GlobeClusterCustomerRow[];
};

type GlobePointInput = {
  lat: number;
  lng: number;
  label: string;
  placeLine?: string;
  placeDetail?: string;
  clusterKey?: string;
  orderCount?: number;
  landmarkTitle?: string;
  landmarkSymbol?: string;
  /** Pillar height in globe-radius units (embed `pointAltitude`). */
  towerHeight?: number;
  orderTowerHeight?: number;
  /** Per-email rollup from `buildOrderGlobeClustersFromRevenueOrders` (`OrderGlobeClusterPoint.customers`). */
  customers?: GlobeClusterCustomerRow[];
  /** Alias for embed payload only — prefer **`customers`** from cluster builder. */
  clusterCustomers?: GlobeClusterCustomerRow[];
};

type Props = {
  orderPoints: GlobePointInput[];
  visitorPoints: GlobePointInput[];
  heightPx?: number;
  onClusterDetail?: (detail: GlobeOrderClusterDetail | null) => void;
};

function getAdminGlobeEmbedUrl(): string | null {
  const raw = (import.meta as unknown as { env?: { VITE_ADMIN_GLOBE_EMBED_URL?: string } }).env
    ?.VITE_ADMIN_GLOBE_EMBED_URL;
  const u = typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : '';
  return u || null;
}

/** Parse + merge `registeredUsers` profile fields for iframe / MSG_CLUSTER customer rows. */
function normalizeClusterCustomersFromPayload(raw: unknown): GlobeClusterCustomerRow[] {
  const out: GlobeClusterCustomerRow[] = [];
  if (!Array.isArray(raw)) return enrichOrderGlobeClusterCustomers(out);
  for (const c of raw) {
    if (!c || typeof c !== 'object') continue;
    const o = c as Record<string, unknown>;
    const email = typeof o.email === 'string' ? o.email.trim() : '';
    if (!email) continue;
    const ageRaw = o.age;
    const ageParsed =
      typeof ageRaw === 'number' && Number.isFinite(ageRaw)
        ? ageRaw
        : typeof ageRaw === 'string' && ageRaw.trim()
          ? parseInt(ageRaw, 10)
          : NaN;
    out.push({
      email,
      orderCount: Number(o.orderCount) || 0,
      totalSpent: Number(o.totalSpent) || 0,
      topProduct: typeof o.topProduct === 'string' ? o.topProduct : '—',
      displayName: typeof o.displayName === 'string' ? o.displayName : undefined,
      profileImageUrl: typeof o.profileImageUrl === 'string' ? o.profileImageUrl : undefined,
      age: Number.isFinite(ageParsed) ? ageParsed : null,
    });
  }
  return enrichOrderGlobeClusterCustomers(out);
}

function mergeData(visitorPoints: Props['visitorPoints'], orderPoints: Props['orderPoints']): LiveGlobePoint[] {
  return [
    ...visitorPoints.map((p) => {
      const place =
        p.placeLine && p.placeLine.trim()
          ? { placeLine: p.placeLine.trim(), placeDetail: p.placeDetail?.trim() }
          : visitorPlaceFieldsFromHeartbeatLabel(p.label);
      return { ...p, ...place, kind: 'visitor' as const };
    }),
    ...orderPoints.map((p) => {
      const place =
        p.placeLine && p.placeLine.trim()
          ? { placeLine: p.placeLine.trim(), placeDetail: p.placeDetail?.trim() }
          : orderPlaceFieldsFromGlobeLabel(p.label);
      const th = p.orderTowerHeight ?? p.towerHeight;
      const clusterCustomers = p.clusterCustomers ?? p.customers;
      return {
        lat: p.lat,
        lng: p.lng,
        label: p.label,
        ...place,
        kind: 'order' as const,
        clusterKey: p.clusterKey,
        orderCount: p.orderCount,
        landmarkTitle: p.landmarkTitle,
        landmarkSymbol: p.landmarkSymbol,
        orderTowerHeight: th,
        clusterCustomers,
      };
    }),
  ];
}

const VIEW = 400;
const CX = VIEW / 2;
const CY = VIEW / 2;
const R = VIEW / 2 - 4;

function project(lat: number, lng: number): { leftPct: number; topPct: number } {
  const clampLat = Math.max(-85, Math.min(85, lat));
  const clampLng = Math.max(-180, Math.min(180, lng));
  return {
    leftPct: ((clampLng + 180) / 360) * 100,
    topPct: ((90 - clampLat) / 180) * 100,
  };
}

function toMapXY(lat: number, lng: number): { x: number; y: number } {
  const clampLat = Math.max(-85, Math.min(85, lat));
  const clampLng = Math.max(-180, Math.min(180, lng));
  return { x: clampLng + 180, y: 90 - clampLat };
}

const D2R = Math.PI / 180;

function interpolateGreatCircle(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  segments: number
): Array<{ x: number; y: number }> {
  const φ1 = lat1 * D2R;
  const λ1 = lng1 * D2R;
  const φ2 = lat2 * D2R;
  const λ2 = lng2 * D2R;
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2
      )
    );
  if (!Number.isFinite(d) || d < 1e-6) {
    const a = toMapXY(lat1, lng1);
    return [a, toMapXY(lat2, lng2)];
  }
  const out: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);
    out.push(toMapXY(φ / D2R, λ / D2R));
  }
  return out;
}

function mapPathToViewBox(pts: Array<{ x: number; y: number }>): string {
  const scaleX = VIEW / 360;
  const scaleY = VIEW / 180;
  if (pts.length === 0) return '';
  let d = `M ${pts[0].x * scaleX} ${pts[0].y * scaleY}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x * scaleX} ${pts[i].y * scaleY}`;
  }
  return d;
}

function buildArcPathsViewBox(visitorPoints: Props['visitorPoints'], orderPoints: Props['orderPoints']): string[] {
  if (orderPoints.length === 0) return [];
  const hub = visitorPoints[0] ?? orderPoints[0];
  if (!hub) return [];
  const max = 16;
  const paths: string[] = [];
  for (let i = 0; i < Math.min(orderPoints.length, max); i++) {
    const o = orderPoints[i];
    if (!o) continue;
    const pts = interpolateGreatCircle(hub.lat, hub.lng, o.lat, o.lng, 28);
    if (pts.length < 2) continue;
    paths.push(mapPathToViewBox(pts));
  }
  return paths;
}

/**
 * Continent dots only: translucent **mint → sky** by latitude (reference-style tint on land),
 * not on the ocean base.
 */
function landDotRgba(lat: number): string {
  const t = Math.max(0, Math.min(1, (lat + 10) / 70));
  const mint = { r: 110, g: 231, b: 183 };
  const sky = { r: 125, g: 211, b: 252 };
  const r = Math.round(mint.r + (sky.r - mint.r) * t);
  const g = Math.round(mint.g + (sky.g - mint.g) * t);
  const b = Math.round(mint.b + (sky.b - mint.b) * t);
  const a = 0.5 + t * 0.38;
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

/** Map lat/lng to orthographic disk (same tilt as land dots). */
function latLngToGlobeDisk(lat: number, lng: number): { px: number; py: number; depth: number } | null {
  const φ = lat * D2R;
  const λ = lng * D2R;
  const tiltX = 0.18;
  const tiltY = -0.12;
  const cosφ = Math.cos(φ);
  let x = cosφ * Math.cos(λ);
  let y = Math.sin(φ);
  let z = cosφ * Math.sin(λ);
  const x1 = x * Math.cos(tiltY) + z * Math.sin(tiltY);
  const z1 = -x * Math.sin(tiltY) + z * Math.cos(tiltY);
  x = x1;
  z = z1;
  const y2 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
  const z2 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
  y = y2;
  z = z2;
  if (z < -0.06) return null;
  return {
    px: CX + x * (R - 6),
    py: CY - y * (R - 6),
    depth: (z + 1) / 2,
  };
}

/** Admin boundary polyline → SVG path `d` on orthographic disk (great-circle segments). */
function boundaryPathToViewBoxD(path: Array<[number, number]>): string | null {
  if (path.length < 2) return null;
  const parts: string[] = [];
  let started = false;
  for (let i = 0; i < path.length - 1; i++) {
    const [lat1, lng1] = path[i]!;
    const [lat2, lng2] = path[i + 1]!;
    const pts = interpolateGreatCircle(lat1, lng1, lat2, lng2, 8);
    for (let j = 0; j < pts.length; j++) {
      const lat = 90 - pts[j]!.y;
      const lng = pts[j]!.x - 180;
      const disk = latLngToGlobeDisk(lat, lng);
      if (!disk) {
        started = false;
        continue;
      }
      if (!started) {
        parts.push(`M ${disk.px.toFixed(2)} ${disk.py.toFixed(2)}`);
        started = true;
      } else {
        parts.push(`L ${disk.px.toFixed(2)} ${disk.py.toFixed(2)}`);
      }
    }
  }
  if (parts.length === 0) return null;
  return parts.join(' ');
}

/** Flat-top regular hex path (screen px) for honeycomb-style land (SVG analogue to H3 mesh). */
function flatHexPathD(cx: number, cy: number, re: number): string {
  const pts: string[] = [];
  for (let k = 0; k < 6; k++) {
    const ang = (k * Math.PI) / 3;
    const x = cx + re * Math.cos(ang);
    const y = cy + re * Math.sin(ang);
    pts.push(`${k === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${pts.join(' ')} Z`;
}

function buildLandHexPathsFromSamples(
  samples: Array<{ lat: number; lng: number }>
): Array<{ d: string; fill: string }> {
  const out: Array<{ d: string; fill: string }> = [];
  for (const { lat, lng } of samples) {
    const disk = latLngToGlobeDisk(lat, lng);
    if (!disk) continue;
    const re = 0.62 + disk.depth * 0.42;
    out.push({
      d: flatHexPathD(disk.px, disk.py, re),
      fill: landDotRgba(lat),
    });
  }
  return out;
}

const CLUSTER_CLIENT_AVATAR_FALLBACK = '/assets/profile-thumb.png';

function ClusterDetailPanel({ detail, onClose }: { detail: GlobeOrderClusterDetail; onClose: () => void }) {
  const money = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Order location breakdown"
      className="fixed inset-0 z-[99998] pointer-events-none"
      onClick={onClose}
    >
      <div
        className="pointer-events-auto absolute overflow-y-auto p-3 shadow-2xl"
        style={{
          top: '50%',
          transform: 'translateY(calc(-50% + 8px))',
          /** Larger `right` nudges the panel **left** (cumulative +30px vs base inset). */
          right: 'calc(max(12px, env(safe-area-inset-right)) + 30px)',
          width: 'min(92vw, 182px)',
          height: 'min(92vw, 182px)',
          maxHeight: 'min(92vw, 182px)',
          borderRadius: 0,
          border: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(241,245,249,0.14) 100%)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 8px 32px rgba(15,23,42,0.25), inset 0 1px 0 rgba(255,255,255,0.35)',
        }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-2 mb-2">
          <div>
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', margin: 0, textTransform: 'uppercase' }}>
              {detail.placeLine}
            </p>
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '10px',
                color: '#000000',
                margin: '5px 0 0 0',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              {detail.orderCount} order{detail.orderCount === 1 ? '' : 's'} · {detail.viewCount}{' '}
              view{detail.viewCount === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1"
            aria-label="Close"
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '10px',
              color: '#64748b',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transform: 'translateY(-5px)',
            }}
          >
            ✕
          </button>
        </div>
        <div className="space-y-2 mt-2">
          {detail.customers.length === 0 ? (
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#000000', margin: 0, textTransform: 'uppercase' }}>
              No customer rows for this cluster.
            </p>
          ) : (
            detail.customers.map((c) => {
              const avatar = (c.profileImageUrl && String(c.profileImageUrl).trim()) || CLUSTER_CLIENT_AVATAR_FALLBACK;
              const name = (c.displayName && String(c.displayName).trim()) || c.email;
              const agePart = typeof c.age === 'number' && Number.isFinite(c.age) ? `, ${c.age}` : '';
              return (
                <div
                  key={c.email}
                  className="border px-2 py-2 flex gap-2 min-w-0"
                  style={{ background: 'rgba(255,255,255,0.35)', borderColor: '#e5e7eb', borderRadius: 0 }}
                >
                  <img
                    src={avatar}
                    alt=""
                    width={40}
                    height={40}
                    className="shrink-0 object-cover rounded-full"
                    style={{ width: 40, height: 40, border: '1.3px solid #000000', boxSizing: 'border-box' }}
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      style={{
                        fontFamily: '"Futura PT Book", "Futura PT", sans-serif',
                        fontSize: '11px',
                        color: '#000000',
                        margin: 0,
                        lineHeight: 1.3,
                        textTransform: 'none',
                        wordBreak: 'break-word',
                      }}
                    >
                      {name}
                      {agePart}
                    </p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium", "Futura PT", sans-serif',
                        fontSize: '9px',
                        color: '#475569',
                        margin: '5px 0 0 0',
                        lineHeight: 1.35,
                        textTransform: 'uppercase',
                      }}
                    >
                      {money(c.totalSpent)} · {c.orderCount} order{c.orderCount === 1 ? '' : 's'}
                    </p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book", "Futura PT", sans-serif',
                        fontSize: '9px',
                        color: '#EB1C24',
                        margin: '4px 0 0 0',
                        lineHeight: 1.35,
                        textTransform: 'uppercase',
                      }}
                    >
                      {c.topProduct && c.topProduct !== '—' ? c.topProduct : '—'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function DetailModal({ selected, onClose }: { selected: LiveGlobePoint; onClose: () => void }) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Location detail"
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded border border-black bg-white/95 p-4 shadow-lg backdrop-blur-sm"
        style={{ borderWidth: '1.3px' }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-2 mb-2">
          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: BRAND_RED, textTransform: 'uppercase' }}>
            {selected.kind === 'visitor' ? 'Visitor' : 'Order'}
          </span>
          <button type="button" onClick={onClose} className="shrink-0 p-1" aria-label="Close" style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#64748b' }}>
            ✕
          </button>
        </div>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#334155', lineHeight: 1.45, textTransform: 'uppercase' }}>
          {selected.label}
        </p>
        <p
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '9px',
            color: '#94a3b8',
            marginTop: '8px',
            textTransform: 'uppercase',
          }}
        >
          {selected.lat.toFixed(2)}°, {selected.lng.toFixed(2)}°
        </p>
      </div>
    </div>,
    document.body
  );
}

/**
 * Loads **only** from `embed/admin-globe` deploy — **globe.gl / three never ship in the main bundle**.
 * Markers are drawn in WebGL inside the iframe (tap a dot on the globe).
 */
function AdminRevenueLiveGlobeIframeEmbed({
  embedUrl,
  orderPoints,
  visitorPoints,
  heightPx = 324,
  onClusterDetail,
}: Props & { embedUrl: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  /** Skip duplicate `postMessage` payloads — each one rebuilds hex bins in the iframe (expensive). */
  const lastPointsJsonRef = useRef<string>('');
  const [embedReady, setEmbedReady] = useState(false);
  const [selected, setSelected] = useState<LiveGlobePoint | null>(null);
  const [clusterDetail, setClusterDetail] = useState<GlobeOrderClusterDetail | null>(null);
  /** Prior max 320px; +35% so larger `heightPx` from revenue is not clamped. */
  const size = Math.min(heightPx, 432);

  const pointsPayload = useMemo(() => {
    return [
      ...visitorPoints.map((p) => {
        const place =
          p.placeLine && p.placeLine.trim()
            ? { placeLine: p.placeLine.trim(), placeDetail: p.placeDetail?.trim() }
            : visitorPlaceFieldsFromHeartbeatLabel(p.label);
        return { ...p, ...place, kind: 'visitor' as const };
      }),
      ...orderPoints.map((p) => {
        const place =
          p.placeLine && p.placeLine.trim()
            ? { placeLine: p.placeLine.trim(), placeDetail: p.placeDetail?.trim() }
            : orderPlaceFieldsFromGlobeLabel(p.label);
        const th = p.orderTowerHeight ?? p.towerHeight;
        const clusterCustomers = enrichOrderGlobeClusterCustomers(p.clusterCustomers ?? p.customers ?? []);
        return {
          lat: p.lat,
          lng: p.lng,
          label: p.label,
          ...place,
          kind: 'order' as const,
          clusterKey: p.clusterKey,
          orderCount: p.orderCount,
          landmarkTitle: p.landmarkTitle,
          landmarkSymbol: p.landmarkSymbol,
          orderTowerHeight: th,
          clusterCustomers,
        };
      }),
    ];
  }, [visitorPoints, orderPoints]);

  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win || !embedReady) return;
    try {
      win.postMessage({ type: MSG_UI_CLUSTER_PANEL, open: Boolean(clusterDetail) }, '*');
    } catch {
      /* ignore */
    }
  }, [clusterDetail, embedReady]);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      if (ev.source !== iframeRef.current?.contentWindow) return;
      const d = ev.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === MSG_READY) {
        setEmbedReady(true);
        return;
      }
      if (d.type === MSG_POINT) {
        const kind = d.kind === 'order' ? 'order' : 'visitor';
        const lat = Number(d.lat);
        const lng = Number(d.lng);
        const label = typeof d.label === 'string' ? d.label : '';
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        setSelected({ lat, lng, label, kind });
      }
      if (d.type === MSG_POV) {
        const clusterPanel = Boolean(d.clusterPanel);
        if (!clusterPanel) {
          setClusterDetail(null);
          onClusterDetail?.(null);
        }
      }
      if (d.type === MSG_CLUSTER) {
        const clusterKey = typeof d.clusterKey === 'string' ? d.clusterKey : '';
        const placeLine = typeof d.placeLine === 'string' ? d.placeLine : '';
        const orderCount = Number(d.orderCount) || 0;
        const viewCount = Number(d.viewCount) || 0;
        const landmarkTitle = typeof d.landmarkTitle === 'string' ? d.landmarkTitle : '';
        const landmarkSymbol = typeof d.landmarkSymbol === 'string' ? d.landmarkSymbol : '📍';
        const customers = normalizeClusterCustomersFromPayload(d.customers);
        const detail: GlobeOrderClusterDetail = {
          clusterKey,
          placeLine,
          orderCount,
          viewCount,
          landmarkTitle,
          landmarkSymbol,
          customers,
        };
        setClusterDetail(detail);
        onClusterDetail?.(detail);
        const winEarly = iframeRef.current?.contentWindow;
        if (winEarly) {
          try {
            winEarly.postMessage({ type: MSG_UI_CLUSTER_PANEL, open: true }, '*');
          } catch {
            /* ignore */
          }
        }
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [onClusterDetail]);

  useEffect(() => {
    if (!embedReady) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const json = JSON.stringify(pointsPayload);
    if (json === lastPointsJsonRef.current) return;
    lastPointsJsonRef.current = json;
    win.postMessage({ type: MSG_IN, points: pointsPayload }, '*');
  }, [embedReady, pointsPayload]);

  const bust = typeof __GLOBE_EMBED_BUILD__ === 'string' ? __GLOBE_EMBED_BUILD__ : 'dev';
  const src = embedUrl.includes('?') ? `${embedUrl}&b=${encodeURIComponent(bust)}` : `${embedUrl}?b=${encodeURIComponent(bust)}`;

  return (
    <>
      <div className="flex justify-center w-full" data-admin-globe-mode="iframe-webgl">
        {/** Clip rectangular iframe/document to a disk so transparent corners show marble, not embed gray. */}
        <div
          className="mx-auto overflow-hidden shrink-0"
          style={{
            width: '100%',
            maxWidth: size,
            aspectRatio: '1 / 1',
            height: 'auto',
            borderRadius: '50%',
            background: 'transparent',
          }}
        >
          <iframe
            ref={iframeRef}
            title="Admin live globe (WebGL)"
            src={src}
            className="border-0 block"
            style={{
              width: '100%',
              height: '100%',
              minWidth: 0,
              minHeight: 0,
              background: 'transparent',
            }}
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
      {selected && <DetailModal selected={selected} onClose={() => setSelected(null)} />}
      {clusterDetail && (
        <ClusterDetailPanel
          detail={clusterDetail}
          onClose={() => {
            setClusterDetail(null);
            onClusterDetail?.(null);
          }}
        />
      )}
    </>
  );
}

/** Fallback when `VITE_ADMIN_GLOBE_EMBED_URL` is unset — no three.js in main `vendor`. */
function AdminRevenueLiveGlobeSvgMap({ orderPoints, visitorPoints, heightPx = 324 }: Props) {
  const clipId = useId().replace(/:/g, '');
  const gradId = useId().replace(/:/g, '');
  const borderCountryGradId = useId().replace(/:/g, '');
  const borderStateGradId = useId().replace(/:/g, '');
  /** Prior max 300px; +35% to match revenue globe scale. */
  const size = Math.min(heightPx, 405);
  const points = useMemo(() => mergeData(visitorPoints, orderPoints), [visitorPoints, orderPoints]);
  const arcPaths = useMemo(() => buildArcPathsViewBox(visitorPoints, orderPoints), [visitorPoints, orderPoints]);
  const [landHexPaths, setLandHexPaths] = useState<Array<{ d: string; fill: string }>>([]);
  const [borderCountryPaths, setBorderCountryPaths] = useState<string[]>([]);
  const [borderStatePaths, setBorderStatePaths] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [samples, split] = await Promise.all([
          loadLandSamplesForGlobe(22_000, '/ne_110m_land.geojson'),
          loadCountryAndStateBoundaryPathsSplit(240, 520),
        ]);
        if (!cancelled) {
          setLandHexPaths(buildLandHexPathsFromSamples(samples));
          const countryD: string[] = [];
          for (const p of split.countries) {
            const d = boundaryPathToViewBoxD(p);
            if (d) countryD.push(d);
          }
          const stateD: string[] = [];
          for (const p of split.states) {
            const d = boundaryPathToViewBoxD(p);
            if (d) stateD.push(d);
          }
          setBorderCountryPaths(countryD);
          setBorderStatePaths(stateD);
        }
      } catch {
        if (!cancelled) {
          setLandHexPaths([]);
          setBorderCountryPaths([]);
          setBorderStatePaths([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const [selected, setSelected] = useState<LiveGlobePoint | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [pointerDown, setPointerDown] = useState(false);
  const drag = useRef<{ active: boolean; startX: number; startY: number; panX: number; panY: number } | null>(null);

  const clampPan = useCallback(
    (next: { x: number; y: number }, s: number) => {
      const max = 100 * (s - 1);
      return {
        x: Math.max(-max, Math.min(max, next.x)),
        y: Math.max(-max, Math.min(max, next.y)),
      };
    },
    []
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((prev) => {
        const next = Math.min(2.8, Math.max(1, prev + delta));
        setPan((p) => clampPan(p, next));
        return next;
      });
    },
    [clampPan]
  );

  useEffect(() => {
    const onUp = () => {
      drag.current = null;
    };
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setPointerDown(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { active: true, startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d?.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    setPan(clampPan({ x: d.panX + dx, y: d.panY + dy }, scale));
  };

  const onPointerUp = () => {
    drag.current = null;
    setPointerDown(false);
  };

  return (
    <>
      <div className="flex justify-center w-full" data-admin-globe-mode="svg-analytics">
        <div
          className="relative overflow-hidden select-none touch-none admin-revenue-globe-shell"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            touchAction: 'none',
            background: 'transparent',
            boxShadow: 'none',
          }}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          aria-label="Live globe: drag to pan, scroll to zoom, tap a dot for details"
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            <div
              className="absolute inset-0 admin-revenue-globe-spin-slow"
              style={
                pointerDown || scale > 1.02 ? { animationPlayState: 'paused' as const } : undefined
              }
            >
              <svg
                width={VIEW}
                height={VIEW}
                viewBox={`0 0 ${VIEW} ${VIEW}`}
                className="absolute left-1/2 top-1/2 max-w-none max-h-none pointer-events-none"
                style={{
                  width: VIEW,
                  height: VIEW,
                  marginLeft: -VIEW / 2,
                  marginTop: -VIEW / 2,
                }}
                aria-hidden
              >
                <defs>
                  {/** Uniform translucent light gray ocean — gradient tint lives on land dots only. */}
                  <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(252, 252, 253, 0.12)" />
                    <stop offset="100%" stopColor="rgba(226, 232, 240, 0.18)" />
                  </radialGradient>
                  <clipPath id={clipId}>
                    <circle cx={CX} cy={CY} r={R} />
                  </clipPath>
                  <linearGradient id={borderCountryGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(51, 65, 85, 0.92)" />
                    <stop offset="100%" stopColor="rgba(148, 163, 184, 0.88)" />
                  </linearGradient>
                  <linearGradient id={borderStateGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(71, 85, 105, 0.88)" />
                    <stop offset="100%" stopColor="rgba(100, 116, 139, 0.78)" />
                  </linearGradient>
                </defs>

                <circle cx={CX} cy={CY} r={R} fill={`url(#${gradId})`} />

                <g clipPath={`url(#${clipId})`}>
                  {landHexPaths.map((h, i) => (
                    <path key={`land-hex-${i}`} d={h.d} fill={h.fill} stroke="rgba(255,255,255,0.12)" strokeWidth={0.15} />
                  ))}
                  {/** Borders on top of land fill so country/state lines read clearly. */}
                  {borderCountryPaths.map((d, i) => (
                    <path
                      key={`border-c-${i}`}
                      d={d}
                      fill="none"
                      stroke={`url(#${borderCountryGradId})`}
                      strokeWidth={1.05}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.95}
                    />
                  ))}
                  {borderStatePaths.map((d, i) => (
                    <path
                      key={`border-s-${i}`}
                      d={d}
                      fill="none"
                      stroke={`url(#${borderStateGradId})`}
                      strokeWidth={0.72}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.92}
                    />
                  ))}
                  {arcPaths.map((d, i) => (
                    <path
                      key={`arc-${i}`}
                      d={d}
                      fill="none"
                      stroke={ORDER_GREEN}
                      strokeWidth={1.2}
                      strokeLinecap="round"
                      strokeDasharray="6 10"
                      className="admin-revenue-globe-arc-dash"
                      opacity={0.5}
                    />
                  ))}
                </g>
              </svg>

              {points.map((p, i) => {
                const { leftPct, topPct } = project(p.lat, p.lng);
                const color = p.kind === 'visitor' ? BRAND_RED : ORDER_GREEN;
                return (
                  <button
                    key={`${p.kind}-${i}`}
                    type="button"
                    className="absolute rounded-full cursor-pointer z-10"
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: 11,
                      height: 11,
                      marginLeft: -5.5,
                      marginTop: -5.5,
                      background: color,
                      border: '2px solid rgba(255,255,255,0.92)',
                      padding: 0,
                      boxShadow:
                        p.kind === 'visitor'
                          ? `0 0 0 1px rgba(0,0,0,0.2), 0 0 12px ${BRAND_RED}88`
                          : `0 0 0 1px rgba(0,0,0,0.2), 0 0 10px ${ORDER_GREEN}66`,
                    }}
                    title={p.label}
                    aria-label={p.label}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setSelected(p);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {selected && <DetailModal selected={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

/**
 * Admin revenue globe: **WebGL** via **`embed/admin-globe`** iframe when **`VITE_ADMIN_GLOBE_EMBED_URL`**
 * is set at **main app build** time (three.js never in main `vendor`). Otherwise SVG fallback.
 */
export default function AdminRevenueLiveGlobe(props: Props) {
  const embedUrl = useMemo(() => getAdminGlobeEmbedUrl(), []);
  if (embedUrl) {
    return <AdminRevenueLiveGlobeIframeEmbed {...props} embedUrl={embedUrl} />;
  }
  return <AdminRevenueLiveGlobeSvgMap {...props} />;
}
