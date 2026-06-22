import { useMemo, useState } from 'react';
import { DESKTOP_FLOORS } from '../../constants/desktopFloors';
import {
  floorIdToSpineRatio,
  getDirectoryFloorNumber,
  getDirectoryFloorStatus,
} from '../../constants/desktopFloorDirectory';
import { useDesktopTowerTravel } from '../desktop-tower/DesktopTowerNavProvider';
import './DesktopFloorDirectory.css';

type DesktopFloorElevatorProps = {
  side?: 'left' | 'right';
};

export function DesktopFloorElevator({ side = 'right' }: DesktopFloorElevatorProps) {
  const { journey, travelDisplayLevelId, selectedFloorId, setSelectedFloorId } = useDesktopTowerTravel();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const floorIds = useMemo(() => DESKTOP_FLOORS.map((f) => f.id), []);

  const spineFloorId = useMemo(() => {
    if (journey) return Math.round(travelDisplayLevelId);
    return selectedFloorId;
  }, [journey, selectedFloorId, travelDisplayLevelId]);

  const spineLightTop = useMemo(() => {
    const ratio = floorIdToSpineRatio(spineFloorId, floorIds);
    return `${ratio * 100}%`;
  }, [spineFloorId, floorIds]);

  const spinePulseClass = journey
    ? journey.direction === 'up'
      ? 'floor-directory__spine-pulse--up'
      : 'floor-directory__spine-pulse--down'
    : '';

  const handleSelect = (floorId: number) => {
    if (journey) return;
    setSelectedFloorId(floorId);
  };

  return (
    <div
      className="floor-directory"
      style={{
        position: 'absolute',
        bottom: 'clamp(96px, 13vh, 148px)',
        ...(side === 'right'
          ? { right: 'clamp(10px, 1.2vw, 18px)' }
          : { left: 'clamp(10px, 1.2vw, 18px)' }),
        top: 'auto',
        transform: 'none',
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
            className={`floor-directory__spine-glow ${journey || selectedFloorId ? 'floor-directory__spine-glow--active' : ''}`}
            style={{ top: spineLightTop }}
            aria-hidden
          />

          {DESKTOP_FLOORS.map((floor) => {
            const isSelected = floor.id === selectedFloorId;
            const isHovered = hoveredId === floor.id;
            const status = getDirectoryFloorStatus(isSelected, isHovered);

            return (
              <div key={floor.path} className="floor-directory__card-wrap">
                <div
                  className={`floor-directory__card-glow ${isSelected ? 'floor-directory__card-glow--active' : ''}`}
                  aria-hidden
                />
                <button
                  type="button"
                  className={[
                    'floor-directory__card',
                    isSelected ? 'floor-directory__card--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={!!journey}
                  onClick={() => handleSelect(floor.id)}
                  onMouseEnter={() => setHoveredId(floor.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  aria-pressed={isSelected}
                  aria-label={`Level ${floor.id} ${floor.name}`}
                >
                  <span className="floor-directory__number">{getDirectoryFloorNumber(floor.id)}</span>
                  <span className="floor-directory__body">
                    <span className="floor-directory__name">{floor.name}</span>
                    {status ? <span className="floor-directory__status">{status}</span> : null}
                  </span>
                  {!isSelected ? (
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
