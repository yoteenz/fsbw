import { useMemo } from 'react';

type Pt = { lat: number; lng: number; label: string; kind: 'visitor' | 'order' };

type Props = {
  orderPoints: Array<{ lat: number; lng: number; label: string }>;
  visitorPoints: Array<{ lat: number; lng: number; label: string }>;
  heightPx?: number;
};

/** Equirectangular: lng [-180,180] → x%, lat [-90,90] → y% (WebGL globe removed — keeps bundle small / mobile-safe). */
function project(lat: number, lng: number): { leftPct: number; topPct: number } {
  const clampLat = Math.max(-85, Math.min(85, lat));
  const clampLng = Math.max(-180, Math.min(180, lng));
  return {
    leftPct: ((clampLng + 180) / 360) * 100,
    topPct: ((90 - clampLat) / 180) * 100,
  };
}

/**
 * Shopify Live View–style map: cyan = active visitors (last 5 min heartbeats),
 * purple = order ship-to locations. Pure SVG + CSS (no WebGL / three.js).
 */
export default function AdminRevenueLiveGlobe({ orderPoints, visitorPoints, heightPx = 220 }: Props) {
  const points: Pt[] = useMemo(
    () => [
      ...visitorPoints.map((p) => ({ ...p, kind: 'visitor' as const })),
      ...orderPoints.map((p) => ({ ...p, kind: 'order' as const })),
    ],
    [orderPoints, visitorPoints]
  );

  return (
    <div
      className="w-full overflow-hidden rounded-md border border-gray-200 bg-sky-50/80"
      style={{ height: heightPx, minHeight: heightPx, position: 'relative' }}
      aria-label="Live map: visitors and orders by location"
    >
      {/* Equirectangular world map (static, cacheable) */}
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-90"
        draggable={false}
        loading="lazy"
        decoding="async"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-sky-100/30 to-transparent pointer-events-none"
        aria-hidden
      />
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        {points.map((p, i) => {
          const { leftPct, topPct } = project(p.lat, p.lng);
          const color = p.kind === 'visitor' ? '#22d3ee' : '#a855f7';
          const title = p.label;
          return (
            <span
              key={`${p.kind}-${i}-${leftPct.toFixed(2)}-${topPct.toFixed(2)}`}
              title={title}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: 10,
                height: 10,
                marginLeft: -5,
                marginTop: -5,
                borderRadius: '50%',
                background: color,
                boxShadow: '0 0 0 1px rgba(255,255,255,0.85)',
                pointerEvents: 'auto',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
