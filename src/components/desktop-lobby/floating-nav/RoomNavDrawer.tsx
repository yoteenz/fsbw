import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getDesktopFloorByPath,
  resolveDesktopActiveDestinationId,
} from '../../../constants/desktopFloors';
import { buildDesktopDestinationHref } from '../../../constants/desktopNavQuickRoutes';
import {
  getDirectoryZoneStatus,
  resolveRoomTravelDirection,
  roomIndexToConnectorRatio,
} from '../../../constants/desktopRoomDirectory';
import { useDesktopTowerTravel } from '../../desktop-tower/DesktopTowerNavProvider';
import { FloatingNavDrawerShell } from './FloatingNavTrigger';
import '../DesktopRoomDirectory.css';

type Props = {
  isOpen: boolean;
  onClose?: () => void;
};

export function RoomNavDrawer({ isOpen, onClose }: Props) {
  const location = useLocation();
  const { quickTravelTo, journey } = useDesktopTowerTravel();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [pulseDirection, setPulseDirection] = useState<'left' | 'right' | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  const currentFloor = getDesktopFloorByPath(location.pathname);
  const zones = currentFloor?.zones ?? [];
  const zoneCount = zones.length;

  const currentDestinationId = currentFloor
    ? resolveDesktopActiveDestinationId(currentFloor, location.search)
    : null;

  const activeZoneIndex = useMemo(() => {
    if (!currentFloor || !currentDestinationId) return -1;
    return zones.findIndex((z) => z.id === currentDestinationId);
  }, [currentDestinationId, currentFloor, zones]);

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
    if (!currentFloor || journey || index === activeZoneIndex) return;

    const fromIndex = activeZoneIndex >= 0 ? activeZoneIndex : 0;
    const direction = resolveRoomTravelDirection(fromIndex, index);
    if (direction) {
      setPulseDirection(direction);
      setPulseKey((k) => k + 1);
    }

    setPendingIndex(index);

    const href = buildDesktopDestinationHref(currentFloor.path, zoneId);
    quickTravelTo(href);
    onClose?.();

    window.setTimeout(() => {
      setPendingIndex(null);
      setPulseDirection(null);
    }, 900);
  };

  if (!currentFloor || zoneCount === 0) return null;

  return (
    <FloatingNavDrawerShell isOpen={isOpen} anchor="bottom-left">
      <div className="room-directory" aria-label={`${currentFloor.name} destination directory`}>
        <div className="room-directory__marble-base" aria-hidden />
        <div className="room-directory__frame">
          <div className="room-directory__chrome-cap" aria-hidden />
          <div className="room-directory__crystal-edge" aria-hidden />

          <header className="room-directory__header">
            <div className="room-directory__header-label">Frontal Slayer</div>
            <div className="room-directory__header-title">{currentFloor.name}</div>
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
    </FloatingNavDrawerShell>
  );
}

/** Whether the current route has zones worth showing a room trigger for. */
export function useCurrentFloorHasRooms(): boolean {
  const location = useLocation();
  const currentFloor = getDesktopFloorByPath(location.pathname);
  return (currentFloor?.zones.length ?? 0) > 0;
}
