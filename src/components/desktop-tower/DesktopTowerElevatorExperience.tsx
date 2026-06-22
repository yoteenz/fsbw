import { useMemo } from 'react';
import { getDesktopFloorById, type DesktopFloor } from '../../constants/desktopFloors';
import {
  DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT,
  DESKTOP_TOWER_ELEVATOR_SHELL_URL,
  DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH,
} from '../../constants/desktopTowerEnv';
import { TOWER_SHELL_HOLO } from '../../constants/desktopTowerElevatorLayout';
import { formatTowerLevelLabel, type TowerTravelDirection } from '../../constants/desktopTowerMotion';
import './DesktopTowerElevator.css';

export type TowerElevatorPhase = 'boarding' | 'traveling' | 'arrived' | 'opening' | 'exiting';

type Props = {
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
  fromFloor,
  toFloor,
  phase,
  displayLevelId,
}: Props) {
  const nearestFloorId = Math.round(displayLevelId);
  const nearestFloor = getDesktopFloorById(nearestFloorId) ?? fromFloor;

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

  const exiting = phase === 'exiting';
  const traveling = phase === 'traveling';

  return (
    <div
      className={`desktop-tower-elevator ${exiting ? 'desktop-tower-elevator--exiting' : ''}`}
      role="dialog"
      aria-label={`Elevator traveling to ${toFloor.name}`}
      aria-live="polite"
    >
      <div className="desktop-tower-elevator__shell">
        <img
          src={DESKTOP_TOWER_ELEVATOR_SHELL_URL}
          alt=""
          className="desktop-tower-elevator__shell-img"
          draggable={false}
          width={DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH}
          height={DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT}
        />

        <div
          className={`desktop-tower-elevator__holo ${holo.accent ? 'desktop-tower-elevator__holo--accent' : ''}`}
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
