import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DESKTOP_FLOORS,
  getDesktopFloorByPath,
  resolveDesktopActiveDestinationId,
  type DesktopFloor,
} from '../../constants/desktopFloors';
import { buildDesktopDestinationHref } from '../../constants/desktopNavQuickRoutes';
import {
  getDirectoryZoneStatus,
  resolveRoomTravelDirection,
  roomIndexToConnectorRatio,
} from '../../constants/desktopRoomDirectory';
import { useDesktopTowerTravel } from '../desktop-tower/DesktopTowerNavProvider';
import './DesktopRoomDirectory.css';

function getSelectedFloor(floorId: number): DesktopFloor {
  return DESKTOP_FLOORS.find((f) => f.id === floorId) ?? DESKTOP_FLOORS[0];
}

export function DesktopRoomNavPanel() {
  const location = useLocation();
  const { travelTo, quickTravelTo, journey, selectedFloorId } = useDesktopTowerTravel();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [pulseDirection, setPulseDirection] = useState<'left' | 'right' | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  const currentFloor = getDesktopFloorByPath(location.pathname);
  const selectedFloor = getSelectedFloor(selectedFloorId);
  const zones = selectedFloor.zones;
  const zoneCount = zones.length;

  const currentDestinationId = currentFloor
    ? resolveDesktopActiveDestinationId(currentFloor, location.search)
    : null;

  const activeZoneIndex = useMemo(() => {
    if (!currentFloor || currentFloor.id !== selectedFloor.id || !currentDestinationId) return -1;
    return zones.findIndex((z) => z.id === currentDestinationId);
  }, [currentDestinationId, currentFloor, selectedFloor.id, zones]);

  const connectorGlowLeft = useMemo(() => {
    const index = pendingIndex ?? (activeZoneIndex >= 0 ? activeZoneIndex : 0);
    const ratio = roomIndexToConnectorRatio(index, zoneCount);
    const inset = 14;
    const span = 100 - inset * 2;
    return `${inset + ratio * span}%`;
  }, [activeZoneIndex, pendingIndex, zoneCount]);

  const connectorPulseClass = pulseDirection
    ? pulseDirection === 'right'
      ? 'room-directory__connector-pulse--right'
      : 'room-directory__connector-pulse--left'
    : '';

  const handleSelect = (index: number, zoneId: string) => {
    if (journey || index === activeZoneIndex) return;

    const fromIndex = activeZoneIndex >= 0 ? activeZoneIndex : 0;
    const direction = resolveRoomTravelDirection(fromIndex, index);
    if (direction) {
      setPulseDirection(direction);
      setPulseKey((k) => k + 1);
    }

    setPendingIndex(index);

    const href = buildDesktopDestinationHref(selectedFloor.path, zoneId);
    const isSameFloor = currentFloor?.path === selectedFloor.path;

    if (isSameFloor) {
      quickTravelTo(href);
    } else {
      travelTo(href);
    }

    window.setTimeout(() => {
      setPendingIndex(null);
      setPulseDirection(null);
    }, isSameFloor ? 900 : 2800);
  };

  if (zoneCount === 0) return null;

  return (
    <div
      className="room-directory"
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 'clamp(16px, 2.5vh, 32px)',
        transform: 'translateX(-50%)',
        zIndex: 50,
        pointerEvents: 'auto',
      }}
      aria-label={`${selectedFloor.name} destination directory`}
    >
      <div className="room-directory__marble-base" aria-hidden />
      <div className="room-directory__frame">
        <div className="room-directory__chrome-cap" aria-hidden />
        <div className="room-directory__crystal-edge" aria-hidden />

        <header className="room-directory__header">
          <div className="room-directory__header-label">Frontal Slayer</div>
          <div className="room-directory__header-title">{selectedFloor.name}</div>
        </header>

        <div className="room-directory__row">
          <div className="room-directory__connector" aria-hidden>
            {pulseDirection ? (
              <div key={pulseKey} className={`room-directory__connector-pulse ${connectorPulseClass}`} />
            ) : null}
          </div>
          <div
            className={`room-directory__connector-glow ${pendingIndex !== null ? 'room-directory__connector-glow--traveling' : ''}`}
            style={{ left: connectorGlowLeft }}
            aria-hidden
          />

          {zones.map((zone, i) => {
            const isHere = i === activeZoneIndex;
            const isPending = pendingIndex === i && !isHere;
            const isHovered = hoveredIndex === i;
            const status = getDirectoryZoneStatus(isHere, isPending, isHovered);

            return (
              <div key={zone.id} className="room-directory__card-wrap">
                <div
                  className={`room-directory__card-glow ${isHere ? 'room-directory__card-glow--active' : ''}`}
                  aria-hidden
                />
                <button
                  type="button"
                  className={[
                    'room-directory__card',
                    isHere ? 'room-directory__card--active' : '',
                    isPending ? 'room-directory__card--destination' : '',
                    zone.comingSoon ? 'room-directory__card--coming-soon' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={isHere || !!journey}
                  onClick={() => handleSelect(i, zone.id)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  aria-current={isHere ? 'true' : undefined}
                  aria-label={zone.label}
                >
                  <span className="room-directory__name">{zone.label}</span>
                  {status ? <span className="room-directory__status">{status}</span> : null}
                  {!isHere ? (
                    <span className="room-directory__arrow" aria-hidden>
                      →
                    </span>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
