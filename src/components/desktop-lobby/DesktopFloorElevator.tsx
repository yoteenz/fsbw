import { useMemo, useState } from 'react';
import { DESKTOP_FLOORS } from '../../constants/desktopFloors';
import {
  floorIdToSpineRatio,
  getDirectoryFloorNumber,
  getDirectoryFloorStatus,
} from '../../constants/desktopFloorDirectory';
import { buildDesktopElevatorHref } from '../../constants/desktopNavQuickRoutes';
import { useDesktopTowerTravel } from '../desktop-tower/DesktopTowerNavProvider';
import './DesktopFloorDirectory.css';

type DesktopFloorElevatorProps = {
  activeFloorPath: string;
  side?: 'left' | 'right';
};

export function DesktopFloorElevator({ activeFloorPath, side = 'right' }: DesktopFloorElevatorProps) {
  const { travelTo, journey, travelDisplayLevelId } = useDesktopTowerTravel();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const floorIds = useMemo(() => DESKTOP_FLOORS.map((f) => f.id), []);

  const currentFloorId = useMemo(() => {
    if (journey) return Math.round(travelDisplayLevelId);
    return DESKTOP_FLOORS.find((f) => f.path === activeFloorPath)?.id ?? 4;
  }, [activeFloorPath, journey, travelDisplayLevelId]);

  const spineLightTop = useMemo(() => {
    const ratio = floorIdToSpineRatio(currentFloorId, floorIds);
    return `${ratio * 100}%`;
  }, [currentFloorId, floorIds]);

  const spinePulseClass = journey
    ? journey.direction === 'up'
      ? 'floor-directory__spine-pulse--up'
      : 'floor-directory__spine-pulse--down'
    : '';

  const handleSelect = (floorPath: string, floorId: number, defaultZoneId: string, isActive: boolean) => {
    if (isActive || journey) return;
    setPendingId(floorId);
    travelTo(buildDesktopElevatorHref(floorPath, defaultZoneId));
    window.setTimeout(() => setPendingId(null), 2200);
  };

  return (
    <div
      className="floor-directory"
      style={{
        position: 'absolute',
        top: '50%',
        ...(side === 'right'
          ? { right: 'clamp(12px, 1.5vw, 24px)' }
          : { left: 'clamp(12px, 1.5vw, 24px)' }),
        transform: 'translateY(-50%)',
        zIndex: 50,
        pointerEvents: 'auto',
      }}
      aria-label="Tower floor directory"
    >
      <div className="floor-directory__marble-base" aria-hidden />
      <div className="floor-directory__frame">
        <div className="floor-directory__chrome-cap" aria-hidden />
        <div className="floor-directory__crystal-edge" aria-hidden />

        <header className="floor-directory__header">
          <div className="floor-directory__header-label">Frontal Slayer</div>
          <div className="floor-directory__header-title">Floor directory</div>
        </header>

        <div className="floor-directory__stack">
          <div className="floor-directory__spine" aria-hidden>
            {journey ? (
              <div className={`floor-directory__spine-pulse ${spinePulseClass}`} />
            ) : null}
          </div>
          <div
            className={`floor-directory__spine-glow ${journey || pendingId ? 'floor-directory__spine-glow--active' : ''}`}
            style={{ top: spineLightTop }}
            aria-hidden
          />

          {DESKTOP_FLOORS.map((floor) => {
            const isActive = floor.id === currentFloorId;
            const isDestination =
              (journey?.toFloor.id === floor.id && !isActive) || pendingId === floor.id;
            const isHovered = hoveredId === floor.id;
            const status = getDirectoryFloorStatus(isActive, isDestination, isHovered);

            return (
              <div key={floor.path} className="floor-directory__card-wrap">
                <div
                  className={`floor-directory__card-glow ${isActive ? 'floor-directory__card-glow--active' : ''}`}
                  aria-hidden
                />
                <button
                  type="button"
                  className={[
                    'floor-directory__card',
                    isActive ? 'floor-directory__card--active' : '',
                    isDestination && !isActive ? 'floor-directory__card--destination' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={isActive || !!journey}
                  onClick={() => handleSelect(floor.path, floor.id, floor.defaultZoneId, isActive)}
                  onMouseEnter={() => setHoveredId(floor.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  aria-current={isActive ? 'true' : undefined}
                  aria-label={`Level ${floor.id} ${floor.name}`}
                >
                  <span className="floor-directory__number">{getDirectoryFloorNumber(floor.id)}</span>
                  <span className="floor-directory__body">
                    <span className="floor-directory__name">{floor.name}</span>
                    {status ? <span className="floor-directory__status">{status}</span> : null}
                  </span>
                  {!isActive ? (
                    <span className="floor-directory__arrow" aria-hidden>
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
