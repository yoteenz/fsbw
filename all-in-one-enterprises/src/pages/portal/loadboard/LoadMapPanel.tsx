import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LoadMapData } from '../../../freight/freightRepositoryTypes';
import { computeMapBounds, projectToMapPercent } from '../../../freight/freightGeocoding';
import { aioPaths } from '../../../utils/paths';

interface LoadMapPanelProps {
  mapData: LoadMapData | null;
  loading?: boolean;
  error?: string | null;
  onSearchThisArea?: () => void;
}

export function LoadMapPanel({ mapData, loading, error, onSearchThisArea }: LoadMapPanelProps) {
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);

  const allMarkers = useMemo(() => {
    if (!mapData) return [];
    return [
      ...mapData.loads.map((m) => ({ ...m, type: 'load' as const })),
      ...mapData.trucks.map((m) => ({ ...m, type: 'truck' as const })),
    ];
  }, [mapData]);

  const bounds = useMemo(() => computeMapBounds(allMarkers), [allMarkers]);

  if (loading) {
    return <p className="aio-load-board__empty">Loading map data…</p>;
  }

  if (error) {
    return (
      <div className="aio-load-board-map__error" role="alert">
        <strong>We couldn&apos;t load the map.</strong>
        <p>{error}</p>
      </div>
    );
  }

  if (!mapData || !bounds || allMarkers.length === 0) {
    return (
      <div className="aio-load-board-map__empty">
        <p>No geographic data available for published loads.</p>
        <p className="aio-prototype-note">Coordinates come from stored load locations or city-level cache — not fabricated GPS.</p>
      </div>
    );
  }

  const pickupMarkers = mapData.loads.filter((m) => m.kind === 'pickup');

  return (
    <div className="aio-load-board-map__panel">
      <div className="aio-load-board-map__canvas" aria-label="Load board map">
        {allMarkers.map((marker) => {
          const pos = projectToMapPercent(marker.lat, marker.lng, bounds);
          const isTruck = 'type' in marker && marker.type === 'truck';
          const loadMarker = !isTruck ? marker : null;
          const truckMarker = isTruck ? marker : null;
          const key = isTruck ? `truck-${truckMarker!.truckId}` : `load-${loadMarker!.loadId}-${loadMarker!.kind}`;

          return (
            <button
              key={key}
              type="button"
              className={`aio-load-board-map__marker ${isTruck ? 'is-truck' : loadMarker?.kind === 'pickup' ? 'is-pickup' : 'is-delivery'} ${selectedLoadId === loadMarker?.loadId ? 'is-selected' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              title={
                isTruck
                  ? `${truckMarker!.nickname} — ${truckMarker!.label}`
                  : `${loadMarker!.loadNumber} ${loadMarker!.kind} — ${loadMarker!.city}, ${loadMarker!.state}`
              }
              onClick={() => {
                if (loadMarker) setSelectedLoadId(loadMarker.loadId);
              }}
            />
          );
        })}
      </div>
      <div className="aio-load-board-map__legend">
        <span><i className="dot pickup" /> Pickup</span>
        <span><i className="dot delivery" /> Delivery</span>
        <span><i className="dot truck" /> Last known truck location</span>
      </div>
      {onSearchThisArea && (
        <button type="button" className="aio-btn aio-btn--outline-dark aio-btn--sm" onClick={onSearchThisArea}>
          Search this area
        </button>
      )}
      <ul className="aio-load-board-map__list">
        {pickupMarkers.map((m) => (
          <li key={m.loadId}>
            <Link to={aioPaths.portalLoadBoardLoad(m.loadId)} onClick={() => setSelectedLoadId(m.loadId)}>
              {m.loadNumber} — {m.city}, {m.state}
            </Link>
          </li>
        ))}
      </ul>
      {mapData.trucks.map((t) => (
        <p key={t.truckId} className="aio-load-board-map__truck-note">
          {t.nickname}: {t.label}
          {t.updatedAt ? ` · Updated ${formatRelative(t.updatedAt)}` : ''}
        </p>
      ))}
    </div>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diff / 3600000);
  if (hours < 1) return 'recently';
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
