import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const BRAND_RED = '#EB1C24';
const ORDER_GREEN = '#16a34a';

const GLOBE_TEXTURE = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.2/example/img/earth-dark.jpg';
const GLOBE_BUMP = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.2/example/img/earth-topology.png';

type Props = {
  orderPoints: Array<{ lat: number; lng: number; label: string }>;
  visitorPoints: Array<{ lat: number; lng: number; label: string }>;
  heightPx?: number;
};

type PointRow = { lat: number; lng: number; label: string; kind: 'visitor' | 'order' };
type ArcRow = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string | string[];
};

type GlobeHandle = {
  _destructor(): void;
  width(w?: number): unknown;
  height(h?: number): unknown;
  pointsData(data: PointRow[]): GlobeHandle;
  arcsData(data: ArcRow[]): GlobeHandle;
  pointOfView(pov: { lat?: number; lng?: number; altitude?: number }, ms?: number): unknown;
  controls(): {
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    enableDamping?: boolean;
    dampingFactor?: number;
    minDistance?: number;
    maxDistance?: number;
  };
  onPointClick(cb: (p: object) => void): unknown;
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

/**
 * WebGL globe only — loaded via `React.lazy` from `AdminRevenueLiveGlobe.tsx` so the
 * `globe-gl` chunk is not pulled until this module mounts (avoids ~1.3MB parse on 2D fallback path).
 */
export default function AdminRevenueLiveGlobeWebGL({
  orderPoints,
  visitorPoints,
  heightPx,
  onBroken,
}: Props & { onBroken: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeHandle | null>(null);
  const onBrokenRef = useRef(onBroken);
  onBrokenRef.current = onBroken;
  const [globeReady, setGlobeReady] = useState(false);
  const [selected, setSelected] = useState<{
    lat: number;
    lng: number;
    label: string;
    kind: 'visitor' | 'order';
  } | null>(null);

  const size = Math.min(heightPx ?? 240, 320);

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return undefined;

    const run = async () => {
      try {
        const { default: Globe } = await import('./globeGlLoader');
        if (cancelled || !containerRef.current) return;

        const globe = new Globe(containerRef.current, {
          rendererConfig: {
            alpha: true,
            antialias: false,
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

        globeRef.current = globe as unknown as GlobeHandle;
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
  }, [size]);

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
