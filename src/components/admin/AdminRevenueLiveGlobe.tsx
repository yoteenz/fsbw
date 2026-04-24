import { useMemo, useState, useCallback, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { loadLandSamplesForGlobe } from '../../utils/adminGlobeNe110mLand';

const BRAND_RED = '#EB1C24';
const ORDER_GREEN = '#16a34a';
const OCEAN_BASE = '#e4e4e7';

/** Protocol with `embed/admin-globe/src/main.ts` */
const MSG_IN = 'fsbw-admin-globe';
const MSG_POINT = 'fsbw-admin-globe-point';
const MSG_READY = 'fsbw-admin-globe-ready';

export type LiveGlobePoint = { lat: number; lng: number; label: string; kind: 'visitor' | 'order' };

type Props = {
  orderPoints: Array<{ lat: number; lng: number; label: string }>;
  visitorPoints: Array<{ lat: number; lng: number; label: string }>;
  heightPx?: number;
};

function getAdminGlobeEmbedUrl(): string | null {
  const raw = (import.meta as unknown as { env?: { VITE_ADMIN_GLOBE_EMBED_URL?: string } }).env
    ?.VITE_ADMIN_GLOBE_EMBED_URL;
  const u = typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : '';
  return u || null;
}

function mergeData(visitorPoints: Props['visitorPoints'], orderPoints: Props['orderPoints']): LiveGlobePoint[] {
  return [
    ...visitorPoints.map((p) => ({ ...p, kind: 'visitor' as const })),
    ...orderPoints.map((p) => ({ ...p, kind: 'order' as const })),
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

function landDotRgb(lat: number): string {
  const t = Math.max(0, Math.min(1, (lat + 10) / 70));
  const mint = { r: 110, g: 231, b: 183 };
  const sky = { r: 125, g: 211, b: 252 };
  const r = Math.round(mint.r + (sky.r - mint.r) * t);
  const g = Math.round(mint.g + (sky.g - mint.g) * t);
  const b = Math.round(mint.b + (sky.b - mint.b) * t);
  return `rgb(${r},${g},${b})`;
}

type Hotspot = { cx: number; cy: number; h: number };

function buildHotspotPillars(
  points: LiveGlobePoint[],
  latLngToPx: (lat: number, lng: number) => { px: number; py: number } | null
): Hotspot[] {
  const byKey = new Map<string, LiveGlobePoint[]>();
  for (const p of points) {
    const k = `${(Math.round(p.lat * 2) / 2).toFixed(1)},${(Math.round(p.lng * 2) / 2).toFixed(1)}`;
    const arr = byKey.get(k) ?? [];
    arr.push(p);
    byKey.set(k, arr);
  }
  const out: Hotspot[] = [];
  for (const [, arr] of byKey) {
    if (arr.length < 2) continue;
    const lat = arr.reduce((s, q) => s + q.lat, 0) / arr.length;
    const lng = arr.reduce((s, q) => s + q.lng, 0) / arr.length;
    const pos = latLngToPx(lat, lng);
    if (!pos) continue;
    out.push({ cx: pos.px, cy: pos.py, h: 8 + Math.min(26, arr.length * 6) });
  }
  return out;
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

function latLngToGlobePx(lat: number, lng: number): { px: number; py: number } | null {
  const d = latLngToGlobeDisk(lat, lng);
  return d ? { px: d.px, py: d.py } : null;
}

function buildLandDotsFromSamples(
  samples: Array<{ lat: number; lng: number }>
): Array<{ cx: number; cy: number; r: number; fill: string; opacity: number }> {
  const out: Array<{ cx: number; cy: number; r: number; fill: string; opacity: number }> = [];
  for (const { lat, lng } of samples) {
    const d = latLngToGlobeDisk(lat, lng);
    if (!d) continue;
    const dark = 0.35 + d.depth * 0.45;
    out.push({
      cx: d.px,
      cy: d.py,
      r: 0.65 + d.depth * 0.5,
      fill: landDotRgb(lat),
      opacity: 0.32 + dark * 0.42,
    });
  }
  return out;
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
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#334155', lineHeight: 1.45, textTransform: 'none' }}>
          {selected.label}
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#94a3b8', marginTop: '8px' }}>
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
  heightPx = 240,
}: Props & { embedUrl: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [embedReady, setEmbedReady] = useState(false);
  const [selected, setSelected] = useState<LiveGlobePoint | null>(null);
  const size = Math.min(heightPx, 320);

  const pointsPayload = useMemo(() => {
    return [
      ...visitorPoints.map((p) => ({ ...p, kind: 'visitor' as const })),
      ...orderPoints.map((p) => ({ ...p, kind: 'order' as const })),
    ];
  }, [visitorPoints, orderPoints]);

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
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  useEffect(() => {
    if (!embedReady) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: MSG_IN, points: pointsPayload }, '*');
  }, [embedReady, pointsPayload]);

  const bust = typeof __GLOBE_EMBED_BUILD__ === 'string' ? __GLOBE_EMBED_BUILD__ : 'dev';
  const src = embedUrl.includes('?') ? `${embedUrl}&b=${encodeURIComponent(bust)}` : `${embedUrl}?b=${encodeURIComponent(bust)}`;

  return (
    <>
      <div className="flex justify-center w-full" data-admin-globe-mode="iframe-webgl">
        <iframe
          ref={iframeRef}
          title="Admin live globe (WebGL)"
          src={src}
          className="rounded-full border-0 mx-auto"
          style={{
            width: size,
            height: size,
            display: 'block',
            boxShadow:
              '0 0 0 1px rgba(161, 161, 170, 0.5), 0 8px 28px rgba(15, 23, 42, 0.12), 0 14px 40px rgba(148, 163, 184, 0.2)',
            background: OCEAN_BASE,
          }}
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
        />
      </div>
      {selected && <DetailModal selected={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

/** Fallback when `VITE_ADMIN_GLOBE_EMBED_URL` is unset — no three.js in main `vendor`. */
function AdminRevenueLiveGlobeSvgMap({ orderPoints, visitorPoints, heightPx = 240 }: Props) {
  const clipId = useId().replace(/:/g, '');
  const gradId = useId().replace(/:/g, '');
  const glowId = useId().replace(/:/g, '');
  const barGradId = useId().replace(/:/g, '');
  const size = Math.min(heightPx, 300);
  const points = useMemo(() => mergeData(visitorPoints, orderPoints), [visitorPoints, orderPoints]);
  const arcPaths = useMemo(() => buildArcPathsViewBox(visitorPoints, orderPoints), [visitorPoints, orderPoints]);
  const [landDots, setLandDots] = useState<Array<{ cx: number; cy: number; r: number; fill: string; opacity: number }>>(
    []
  );
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const samples = await loadLandSamplesForGlobe(3200, '/ne_110m_land.geojson');
        if (!cancelled) setLandDots(buildLandDotsFromSamples(samples));
      } catch {
        if (!cancelled) setLandDots([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const hotspots = useMemo(
    () => buildHotspotPillars(points, latLngToGlobePx),
    [points]
  );

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
                  <radialGradient id={gradId} cx="32%" cy="28%" r="78%">
                    <stop offset="0%" stopColor="#f4f4f5" />
                    <stop offset="45%" stopColor="#e4e4e7" />
                    <stop offset="82%" stopColor="#d4d4d8" />
                    <stop offset="100%" stopColor="#c4c4cc" />
                  </radialGradient>
                  <radialGradient id={glowId} cx="50%" cy="50%" r="52%">
                    <stop offset="78%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
                  </radialGradient>
                  <clipPath id={clipId}>
                    <circle cx={CX} cy={CY} r={R} />
                  </clipPath>
                  <linearGradient id={barGradId} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#d4d4d8" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#52525b" stopOpacity={0.9} />
                  </linearGradient>
                </defs>

                <circle cx={CX} cy={CY} r={R + 2} fill={`url(#${glowId})`} opacity={0.85} />
                <circle cx={CX} cy={CY} r={R} fill={`url(#${gradId})`} />

                <g clipPath={`url(#${clipId})`}>
                  {landDots.map((d, i) => (
                    <circle key={`land-${i}`} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} opacity={d.opacity} />
                  ))}
                  {hotspots.map((h, i) => (
                    <rect
                      key={`bar-${i}`}
                      x={h.cx - 1.8}
                      y={h.cy - h.h}
                      width={3.6}
                      height={h.h}
                      rx={1}
                      fill={`url(#${barGradId})`}
                      opacity={0.5}
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

                <circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke="rgba(113, 113, 122, 0.45)"
                  strokeWidth={1}
                />
                <circle cx={CX} cy={CY} r={R - 1} fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={2} opacity={0.5} />
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
