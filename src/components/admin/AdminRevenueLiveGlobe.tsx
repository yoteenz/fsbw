import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { GlobeInstance } from 'globe.gl';

const BRAND_RED = '#EB1C24';
const ORDER_GREEN = '#16a34a';

/** Dark earth texture (three-globe example asset on jsDelivr CDN). */
const GLOBE_TEXTURE = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.2/example/img/earth-dark.jpg';
const GLOBE_BUMP = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.2/example/img/earth-topology.png';

export type LiveGlobePoint = { lat: number; lng: number; label: string; kind: 'visitor' | 'order' };

type Props = {
  orderPoints: Array<{ lat: number; lng: number; label: string }>;
  visitorPoints: Array<{ lat: number; lng: number; label: string }>;
  heightPx?: number;
};

function mergeData(visitorPoints: Props['visitorPoints'], orderPoints: Props['orderPoints']): LiveGlobePoint[] {
  return [
    ...visitorPoints.map((p) => ({ ...p, kind: 'visitor' as const })),
    ...orderPoints.map((p) => ({ ...p, kind: 'order' as const })),
  ];
}

function project(lat: number, lng: number): { leftPct: number; topPct: number } {
  const clampLat = Math.max(-85, Math.min(85, lat));
  const clampLng = Math.max(-180, Math.min(180, lng));
  return {
    leftPct: ((clampLng + 180) / 360) * 100,
    topPct: ((90 - clampLat) / 180) * 100,
  };
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

type PointRow = { lat: number; lng: number; label: string; kind: 'visitor' | 'order' };
type ArcRow = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string | string[];
};

function buildArcs(visitors: Props['visitorPoints'], orders: Props['orderPoints']): ArcRow[] {
  if (orders.length === 0) return [];
  const hub = visitors[0] ?? orders[0];
  const maxArcs = 16;
  const out: ArcRow[] = [];
  const green = 'rgba(22, 163, 74, 0.42)';
  const greenF = 'rgba(22, 163, 74, 0.12)';
  for (let i = 0; i < Math.min(orders.length, maxArcs); i++) {
    const o = orders[i];
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

/** WebGL globe (globe.gl) — loaded only on this admin route chunk. */
function AdminRevenueLiveGlobeWebGL({
  orderPoints,
  visitorPoints,
  heightPx,
  onBroken,
}: Props & { onBroken: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const onBrokenRef = useRef(onBroken);
  onBrokenRef.current = onBroken;
  const [globeReady, setGlobeReady] = useState(false);
  const [selected, setSelected] = useState<LiveGlobePoint | null>(null);

  const size = Math.min(heightPx ?? 240, 320);

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return undefined;

    const run = async () => {
      try {
        const { default: Globe } = await import('globe.gl');
        if (cancelled || !containerRef.current) return;

        const globe = new Globe(containerRef.current, {
          rendererConfig: {
            alpha: true,
            antialias: true,
            powerPreference: 'low-power',
          },
        })
          .backgroundColor('rgba(15, 23, 42, 0)')
          .globeImageUrl(GLOBE_TEXTURE)
          .bumpImageUrl(GLOBE_BUMP)
          .showGraticules(true)
          .showAtmosphere(true)
          .atmosphereColor('rgba(96, 165, 250, 0.45)')
          .atmosphereAltitude(0.18)
          .width(containerRef.current.clientWidth || size)
          .height(size)
          .pointsTransitionDuration(400)
          .arcsTransitionDuration(600)
          .pointLat('lat')
          .pointLng('lng')
          .pointColor((d: object) => ((d as PointRow).kind === 'visitor' ? BRAND_RED : ORDER_GREEN))
          .pointAltitude(0.012)
          .pointRadius(0.42)
          .pointResolution(12)
          .pointLabel((d: object) => (d as PointRow).label)
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
          /* orbit controls optional */
        }

        globe.onPointClick((p: object) => {
          const row = p as PointRow;
          setSelected({
            lat: row.lat,
            lng: row.lng,
            label: row.label,
            kind: row.kind,
          });
        });

        globeRef.current = globe;
        setGlobeReady(true);
      } catch {
        onBrokenRef.current();
      }
    };

    void run();

    return () => {
      cancelled = true;
      try {
        globeRef.current?._destructor();
      } catch {
        /* ignore */
      }
      globeRef.current = null;
      setGlobeReady(false);
    };
  }, []);

  useEffect(() => {
    if (!globeReady || !globeRef.current) return;
    const rows: PointRow[] = [
      ...visitorPoints.map((p) => ({ ...p, kind: 'visitor' as const })),
      ...orderPoints.map((p) => ({ ...p, kind: 'order' as const })),
    ];
    globeRef.current.pointsData(rows).arcsData(buildArcs(visitorPoints, orderPoints));
  }, [globeReady, visitorPoints, orderPoints]);

  useEffect(() => {
    const el = containerRef.current;
    const g = globeRef.current;
    if (!el || !g || !globeReady) return undefined;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (w > 0) g.width(w);
      g.height(size);
    });
    ro.observe(el);
    g.width(el.clientWidth || size);
    g.height(size);
    return () => ro.disconnect();
  }, [globeReady, size]);

  useEffect(() => {
    const g = globeRef.current;
    if (!g || !globeReady) return;
    g.height(size);
    const el = containerRef.current;
    if (el?.clientWidth) g.width(el.clientWidth);
  }, [globeReady, size]);

  const modal =
    selected &&
    createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Location detail"
        className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(15, 23, 42, 0.45)' }}
        onClick={() => setSelected(null)}
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
            <button type="button" onClick={() => setSelected(null)} className="shrink-0 p-1" aria-label="Close" style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#64748b' }}>
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

  return (
    <>
      <div
        ref={containerRef}
        className="w-full rounded-full overflow-hidden mx-auto"
        style={{
          width: '100%',
          maxWidth: size,
          height: size,
          boxShadow: 'inset 0 0 40px rgba(255,255,255,0.12), 0 10px 28px rgba(15, 23, 42, 0.22)',
          background: 'radial-gradient(circle at 30% 25%, rgba(45, 212, 191, 0.08), transparent 55%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.12), transparent 50%), #0f172a',
        }}
        aria-label="3D globe: drag to rotate, scroll to zoom, tap a dot for details"
      />
      {modal}
    </>
  );
}

/** 2D fallback — no WebGL / chunk failure (keeps admin page usable on low-end devices). */
function AdminRevenueLiveGlobeMap2D({ orderPoints, visitorPoints, heightPx = 240 }: Props) {
  const points = useMemo(() => mergeData(visitorPoints, orderPoints), [visitorPoints, orderPoints]);
  const [selected, setSelected] = useState<LiveGlobePoint | null>(null);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ active: boolean; startX: number; startY: number; panX: number; panY: number } | null>(null);

  const clampPan = useCallback(
    (next: { x: number; y: number }, s: number) => {
      const max = 120 * (s - 1);
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
      const delta = e.deltaY > 0 ? -0.12 : 0.12;
      setScale((prev) => {
        const next = Math.min(3.2, Math.max(1, prev + delta));
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
  };

  const size = Math.min(heightPx, 280);

  const modal =
    selected &&
    createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Location detail"
        className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(15, 23, 42, 0.45)' }}
        onClick={() => setSelected(null)}
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
            <button type="button" onClick={() => setSelected(null)} className="shrink-0 p-1" aria-label="Close" style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#64748b' }}>
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

  return (
    <>
      <div className="flex justify-center w-full">
        <div
          className="relative overflow-hidden select-none touch-none"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            boxShadow: 'inset 0 0 50px rgba(255,255,255,0.35), inset 0 -20px 40px rgba(14, 165, 233, 0.12), 0 10px 28px rgba(15, 23, 42, 0.18)',
            touchAction: 'none',
          }}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          aria-label="Map: drag to pan, scroll to zoom, tap a dot for details"
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-85"
              draggable={false}
              loading="lazy"
            />
            <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 360 180" preserveAspectRatio="none">
              {[-120, -60, 0, 60, 120].map((lng) => (
                <line
                  key={`v-${lng}`}
                  x1={lng + 180}
                  y1={0}
                  x2={lng + 180}
                  y2={180}
                  stroke="rgba(14, 165, 233, 0.35)"
                  strokeWidth={0.8}
                />
              ))}
              {[-60, -30, 0, 30, 60].map((lat) => {
                const y = 90 - lat;
                return (
                  <line
                    key={`h-${lat}`}
                    x1={0}
                    y1={y}
                    x2={360}
                    y2={y}
                    stroke="rgba(14, 165, 233, 0.28)"
                    strokeWidth={0.7}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100/25 via-transparent to-slate-900/10 pointer-events-none" />

            {points.map((p, i) => {
              const { leftPct, topPct } = project(p.lat, p.lng);
              const color = p.kind === 'visitor' ? BRAND_RED : ORDER_GREEN;
              return (
                <button
                  key={`${p.kind}-${i}`}
                  type="button"
                  className="absolute rounded-full border-2 border-white/90 shadow-sm cursor-pointer"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: 12,
                    height: 12,
                    marginLeft: -6,
                    marginTop: -6,
                    background: color,
                    padding: 0,
                    zIndex: 2,
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
      {modal}
    </>
  );
}

/**
 * Admin revenue live view: 3D globe (globe.gl + three) when WebGL is available — lazy-loaded
 * so the main bundle stays small. Falls back to the prior 2D circular map if WebGL is missing
 * or the globe chunk fails (mobile / strict memory).
 */
export default function AdminRevenueLiveGlobe(props: Props) {
  const [use2d, setUse2d] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!hasWebGL()) {
      setUse2d(true);
      return undefined;
    }
    import('globe.gl')
      .then(() => {
        if (!cancelled) setUse2d(false);
      })
      .catch(() => {
        if (!cancelled) setUse2d(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (use2d === null) {
    return (
      <div
        className="w-full flex items-center justify-center rounded-full border border-gray-200 bg-slate-900/40 mx-auto"
        style={{
          width: Math.min(props.heightPx ?? 240, 320),
          height: Math.min(props.heightPx ?? 240, 320),
          fontFamily: '"Futura PT Book"',
          fontSize: '10px',
          color: '#94a3b8',
          textTransform: 'uppercase',
        }}
      >
        Loading globe…
      </div>
    );
  }

  if (use2d) {
    return <AdminRevenueLiveGlobeMap2D {...props} />;
  }

  const onGlobeBroken = useCallback(() => setUse2d(true), []);
  return <AdminRevenueLiveGlobeWebGL {...props} onBroken={onGlobeBroken} />;
}
