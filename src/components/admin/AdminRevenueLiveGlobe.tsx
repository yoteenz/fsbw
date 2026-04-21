import { useEffect, useRef } from 'react';
import type { GlobeInstance } from 'globe.gl';

type Point = { lat: number; lng: number; color: string; label: string };

type Props = {
  orderPoints: Array<{ lat: number; lng: number; label: string }>;
  visitorPoints: Array<{ lat: number; lng: number; label: string }>;
  heightPx?: number;
};

function mergePoints(
  visitorPoints: Array<{ lat: number; lng: number; label: string }>,
  orderPoints: Array<{ lat: number; lng: number; label: string }>
): Point[] {
  return [
    ...visitorPoints.map((p) => ({ ...p, color: '#22d3ee' })),
    ...orderPoints.map((p) => ({ ...p, color: '#a855f7' })),
  ];
}

/**
 * Shopify Live View–style 3D globe: cyan dots = active visitors (last 5 min heartbeats),
 * purple dots = order ship-to locations (from stored orders).
 */
export default function AdminRevenueLiveGlobe({ orderPoints, visitorPoints, heightPx = 220 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const orderRef = useRef(orderPoints);
  const visitorRef = useRef(visitorPoints);
  orderRef.current = orderPoints;
  visitorRef.current = visitorPoints;

  const pushPoints = () => {
    const g = globeRef.current;
    if (!g) return;
    g.pointsData(mergePoints(visitorRef.current, orderRef.current));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    void import('globe.gl').then((mod) => {
      if (cancelled || !containerRef.current) return;
      const Globe = mod.default;
      const w = el.clientWidth || 320;
      const h = heightPx;
      const globe = new Globe(el)
        .width(w)
        .height(h)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .backgroundColor('rgba(255,255,255,0)')
        .showGraticules(true)
        .showAtmosphere(true)
        .atmosphereColor('#7dd3fc')
        .atmosphereAltitude(0.12);

      try {
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.35;
        globe.controls().enableZoom = true;
      } catch {
        // ignore
      }

      globe.pointOfView({ lat: 20, lng: -90, altitude: 2.2 }, 0);

      globe
        .pointLat('lat')
        .pointLng('lng')
        .pointColor('color')
        .pointAltitude(0.02)
        .pointRadius(0.42)
        .pointLabel('label');

      globeRef.current = globe;
      pushPoints();
    });

    const ro = new ResizeObserver(() => {
      const g = globeRef.current;
      const node = containerRef.current;
      if (!g || !node) return;
      g.width(node.clientWidth || 320).height(heightPx);
    });
    ro.observe(el);

    return () => {
      cancelled = true;
      ro.disconnect();
      try {
        globeRef.current?._destructor();
      } catch {
        // ignore
      }
      globeRef.current = null;
    };
  }, [heightPx]);

  useEffect(() => {
    pushPoints();
  }, [orderPoints, visitorPoints]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-md border border-gray-200 bg-gradient-to-b from-sky-50 to-white"
      style={{ height: heightPx, minHeight: heightPx }}
      aria-label="Live globe: visitors and orders by location"
    />
  );
}
