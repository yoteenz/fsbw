import { useMemo } from 'react';
import type { DesktopFloor } from '../../constants/desktopFloors';
import {
  DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT,
  DESKTOP_TOWER_ELEVATOR_SHELL_URL,
  DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH,
} from '../../constants/desktopTowerEnv';
import {
  TOWER_SHELL_FLOOR_MARKER_STEP_PX,
  TOWER_SHELL_FLOOR_SHAFT,
  TOWER_SHELL_HOLO,
} from '../../constants/desktopTowerElevatorLayout';
import { formatTowerLevelLabel, type TowerTravelDirection } from '../../constants/desktopTowerMotion';
import './DesktopTowerElevator.css';

export type TowerElevatorPhase = 'boarding' | 'traveling' | 'arrived' | 'opening' | 'exiting';

type Props = {
  floors: readonly DesktopFloor[];
  fromFloor: DesktopFloor;
  toFloor: DesktopFloor;
  direction: TowerTravelDirection;
  phase: TowerElevatorPhase;
  displayLevelId: number;
};

type HoloState = {
  kicker: string;
  level: string;
  name: string;
  accent?: boolean;
};

export function DesktopTowerElevatorExperience({
  floors,
  fromFloor,
  toFloor,
  direction,
  phase,
  displayLevelId,
}: Props) {
  const floorsTopToBottom = useMemo(
    () => [...floors].sort((a, b) => b.id - a.id),
    [floors],
  );

  const nearestFloorId = Math.round(displayLevelId);
  const nearestFloor = floors.find((f) => f.id === nearestFloorId) ?? fromFloor;

  const shaftOffset = useMemo(() => {
    const index = floorsTopToBottom.findIndex((f) => f.id === nearestFloorId);
    const safeIndex = index >= 0 ? index : floorsTopToBottom.findIndex((f) => f.id === fromFloor.id);
    return -safeIndex * TOWER_SHELL_FLOOR_MARKER_STEP_PX;
  }, [floorsTopToBottom, nearestFloorId, fromFloor.id]);

  const holo = useMemo((): HoloState => {
    if (phase === 'boarding') {
      return {
        kicker: 'Current level',
        level: formatTowerLevelLabel(fromFloor),
        name: fromFloor.name,
      };
    }
    if (phase === 'traveling') {
      return {
        kicker: 'Traveling to',
        level: formatTowerLevelLabel(toFloor),
        name: toFloor.name,
        accent: true,
      };
    }
    return {
      kicker: 'Arrived',
      level: formatTowerLevelLabel(toFloor),
      name: toFloor.name,
      accent: true,
    };
  }, [phase, fromFloor, toFloor]);

  const traveling = phase === 'traveling';
  const arrived = phase === 'arrived' || phase === 'opening';
  const exiting = phase === 'exiting';

  const travelClass = traveling
    ? direction === 'up'
      ? 'desktop-tower-elevator--travel-up'
      : 'desktop-tower-elevator--travel-down'
    : '';

  return (
    <div
      className={`desktop-tower-elevator ${travelClass} ${exiting ? 'desktop-tower-elevator--exiting' : ''}`}
      role="dialog"
      aria-label={`Elevator traveling ${direction} to ${toFloor.name}`}
      aria-live="polite"
    >
      <div
        className="desktop-tower-elevator__shell"
        style={{ aspectRatio: `${DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH} / ${DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT}` }}
      >
        <div className="desktop-tower-elevator__shell-motion">
          <img
            src={DESKTOP_TOWER_ELEVATOR_SHELL_URL}
            alt=""
            className="desktop-tower-elevator__shell-img"
            draggable={false}
            width={DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH}
            height={DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT}
          />
        </div>

        <div className="desktop-tower-elevator__pillar-light desktop-tower-elevator__pillar-light--left" aria-hidden />
        <div className="desktop-tower-elevator__pillar-light desktop-tower-elevator__pillar-light--right" aria-hidden />

        <div
          className="desktop-tower-elevator__shaft"
          style={{
            top: `${TOWER_SHELL_FLOOR_SHAFT.top}%`,
            right: `${TOWER_SHELL_FLOOR_SHAFT.right}%`,
            width: `${TOWER_SHELL_FLOOR_SHAFT.width}%`,
            bottom: `${TOWER_SHELL_FLOOR_SHAFT.bottom}%`,
          }}
          aria-hidden
        >
          <div
            className="desktop-tower-elevator__shaft-track"
            style={{ transform: `translate3d(-50%, ${shaftOffset}px, 0)` }}
          >
            {floorsTopToBottom.map((floor) => {
              const isActive = floor.id === nearestFloorId;
              const isDestination = floor.id === toFloor.id && phase !== 'boarding';
              return (
                <div
                  key={floor.id}
                  className={[
                    'desktop-tower-elevator__floor-marker',
                    isActive ? 'desktop-tower-elevator__floor-marker--active' : '',
                    isDestination && !isActive ? 'desktop-tower-elevator__floor-marker--destination' : '',
                    arrived && isDestination ? 'desktop-tower-elevator__floor-marker--arrived' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="desktop-tower-elevator__floor-level">{formatTowerLevelLabel(floor)}</span>
                  <span className="desktop-tower-elevator__floor-name">{floor.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`desktop-tower-elevator__holo ${holo.accent ? 'desktop-tower-elevator__holo--accent' : ''} ${arrived ? 'desktop-tower-elevator__holo--arrived' : ''}`}
          style={{ top: `${TOWER_SHELL_HOLO.top}%`, width: `${TOWER_SHELL_HOLO.width}%` }}
        >
          <div className="desktop-tower-elevator__holo-label">{holo.kicker}</div>
          <div className="desktop-tower-elevator__holo-level">{holo.level}</div>
          <div className="desktop-tower-elevator__holo-name">{holo.name}</div>
          {traveling ? (
            <div className="desktop-tower-elevator__holo-counter">
              <span className="desktop-tower-elevator__holo-counter-label">Passing</span>
              <span className="desktop-tower-elevator__holo-counter-value">
                {formatTowerLevelLabel(nearestFloor)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
