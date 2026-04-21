import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { GlobeInstance } from 'globe.gl';

const BRAND_RED = '#EB1C24';
const ORDER_GREEN = '#16a34a';

export type LiveGlobePoint = { lat: number; lng: number; label: string; kind: 'visitor' | 'order' };

type Props = {
  orderPoints: Array<{ lat: number; lng: number; label: string }>;
  visitorPoints: Array<{ lat: number; lng: number; label: string }>;
  heightPx?: number;
};

function mergeData(
  visitorPoints: Props['visitorPoints'],
  orderPoints: Props['orderPoints']
): LiveGlobePoint[] {
  return [
    ...visitorPoints.map((p) => ({ ...p, kind: 'visitor' as const })),
    ...orderPoints.map((p) => ({ ...p, kind: 'order' as const })),
  ];
}

/**
 * Interactive 3D globe (globe.gl): brand-red visitors, green orders, graticule grid,
 * auto-rotate + orbit controls. Click a dot for details (portal modal).
 */
export default function AdminRevenueLiveGlobe({ orderPoints, visitorPoints, heightPx = 260 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const dataRef = useRef(mergeData(visitorPoints, orderPoints));
  dataRef.current = mergeData(visitorPoints, orderPoints);

  const [selected, setSelected] = useState<LiveGlobePoint | null>(null);

  const applyPoints = useCallback(() => {
    const g = globeRef.current;
    if (!g) return;
    const pts = dataRef.current.map((d) => ({
      ...d,
      color: d.kind === 'visitor' ? BRAND_RED : ORDER_GREEN,
    }));
    g.pointsData(pts);
  }, []);

  useEffect(() => {
    applyPoints();
  }, [visitorPoints, orderPoints, applyPoints]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;

    void import('globe.gl').then((mod) => {
      if (cancelled || !containerRef.current) return;
      const Globe = mod.default;
      const w = Math.max(280, el.clientWidth);
      const h = heightPx;

      const globe = new Globe(el)
        .width(w)
        .height(h)
        /** Light “glass” globe — subtle blue marble, grid-forward look */
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundColor('rgba(248, 250, 252, 0.92)')
        .showAtmosphere(true)
        .atmosphereColor('#bae6fd')
        .atmosphereAltitude(0.22)
        .showGraticules(true)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor('color')
        .pointAltitude(0.035)
        .pointRadius(0.55)
        .pointResolution(18)
        .pointLabel((d: object) => {
          const p = d as LiveGlobePoint & { color: string };
          return `${p.kind === 'visitor' ? 'Visitor' : 'Order'}: ${p.label}`;
        });

      try {
        const ctrl = globe.controls();
        ctrl.autoRotate = true;
        ctrl.autoRotateSpeed = 0.5;
        ctrl.enableZoom = true;
        ctrl.minDistance = 120;
        ctrl.maxDistance = 500;
      } catch {
        // ignore
      }

      globe.pointOfView({ lat: 22, lng: -40, altitude: 2.35 }, 0);

      globe.onPointClick((obj: object) => {
        const p = obj as LiveGlobePoint;
        setSelected(p);
      });

      globeRef.current = globe;
      applyPoints();
    });

    const ro = new ResizeObserver(() => {
      const g = globeRef.current;
      const node = containerRef.current;
      if (!g || !node) return;
      g.width(Math.max(280, node.clientWidth)).height(heightPx);
    });
    ro.observe(el);

    return () => {
      cancelled = true;
      ro.disconnect();
      try {
        globeRef.current?._destructor();
      } catch {
        /* ignore */
      }
      globeRef.current = null;
    };
  }, [heightPx, applyPoints]);

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
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start gap-2 mb-2">
            <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: BRAND_RED, textTransform: 'uppercase' }}>
              {selected.kind === 'visitor' ? 'Visitor' : 'Order'}
            </span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="shrink-0 p-1"
              aria-label="Close"
              style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#64748b' }}
            >
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
        className="w-full overflow-hidden rounded-md border border-gray-200"
        style={{ height: heightPx, minHeight: heightPx, background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%)' }}
        aria-label="Interactive 3D globe: drag to rotate, scroll to zoom, tap a dot for details"
      />
      {modal}
    </>
  );
}
