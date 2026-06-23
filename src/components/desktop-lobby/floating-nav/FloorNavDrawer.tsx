import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DESKTOP_FLOORS, getDesktopFloorById, getDesktopFloorByPath } from '../../../constants/desktopFloors';
import {
  floorIdToSpineRatio,
  getDirectoryFloorNumber,
  getDirectoryFloorStatus,
  getElevatorDirectoryCardState,
  getElevatorDirectoryStatus,
} from '../../../constants/desktopFloorDirectory';
import { buildDesktopElevatorHref } from '../../../constants/desktopNavQuickRoutes';
import { useDesktopTowerTravel } from '../../desktop-tower/DesktopTowerNavProvider';
import { FloatingNavDrawerShell } from './FloatingNavTrigger';
import '../DesktopFloorDirectory.css';

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  embedded?: boolean;
};

export function FloorNavDrawer({ isOpen, onClose, embedded = false }: Props) {
  const location = useLocation();
  const { journey, travelCabinFloorId, travelPhase, travelTo, setSelectedFloorId } =
    useDesktopTowerTravel();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const currentFloor = getDesktopFloorByPath(location.pathname);
  const floorIds = useMemo(() => DESKTOP_FLOORS.map((f) => f.id), []);

  const spineFloorId = useMemo(() => {
    if (journey) return travelCabinFloorId;
    return currentFloor?.id ?? DESKTOP_FLOORS[0].id;
  }, [currentFloor?.id, journey, travelCabinFloorId]);

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
    const floor = getDesktopFloorById(floorId);
    if (!floor) return;

    setSelectedFloorId(floorId);

    if (currentFloor?.id !== floorId) {
      travelTo(buildDesktopElevatorHref(floor.path, floor.defaultZoneId));
    }

    onClose?.();
  };

  return (
    <FloatingNavDrawerShell isOpen={isOpen || embedded} anchor="bottom-right" embedded={embedded}>
      <div className="floor-directory" aria-label="Tower floor directory">
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
              className={`floor-directory__spine-glow ${journey ? 'floor-directory__spine-glow--active' : ''}`}
              style={{ top: spineLightTop }}
              aria-hidden
            />

            {DESKTOP_FLOORS.map((floor) => {
              const isHere = !journey && floor.id === currentFloor?.id;
              const isHovered = hoveredId === floor.id;
              const elevatorState = journey
                ? getElevatorDirectoryCardState(
                    floor.id,
                    journey.fromFloor.id,
                    journey.toFloor.id,
                    travelCabinFloorId,
                    travelPhase,
                  )
                : null;
              const status = journey
                ? getElevatorDirectoryStatus(elevatorState, journey.direction)
                : getDirectoryFloorStatus(isHere, isHovered);

              const isElevatorFocus =
                elevatorState === 'boarding' ||
                elevatorState === 'passing' ||
                elevatorState === 'destination';

              return (
                <div key={floor.path} className="floor-directory__card-wrap">
                  <button
                    type="button"
                    className={[
                      'floor-directory__card',
                      isHere && !journey ? 'floor-directory__card--active' : '',
                      isElevatorFocus ? 'floor-directory__card--elevator-focus' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={!!journey}
                    onClick={() => handleSelect(floor.id)}
                    onMouseEnter={() => setHoveredId(floor.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    aria-current={isHere || isElevatorFocus ? 'true' : undefined}
                    aria-label={`Level ${floor.id} ${floor.name}`}
                  >
                    <span className="floor-directory__number">{getDirectoryFloorNumber(floor.id)}</span>
                    <span className="floor-directory__body">
                      <span className="floor-directory__name">{floor.name}</span>
                      {status ? <span className="floor-directory__status">{status}</span> : null}
                    </span>
                    {!isHere && !journey ? (
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
    </FloatingNavDrawerShell>
  );
}
