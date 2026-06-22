import { useMemo } from 'react';
import { getDesktopFloorById, type DesktopFloor } from '../../constants/desktopFloors';
import { computeTowerExteriorOffsetY } from '../../constants/desktopTowerExterior';
import {
  DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT,
  DESKTOP_TOWER_ELEVATOR_SHELL_URL,
  DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH,
} from '../../constants/desktopTowerEnv';
import {
  TOWER_SHELL_GLASS_LEFT,
  TOWER_SHELL_GLASS_REAR,
  TOWER_SHELL_GLASS_RIGHT,
  TOWER_SHELL_HOLO,
} from '../../constants/desktopTowerElevatorLayout';
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
  direction,
  phase,
  displayLevelId,
}: Props) {
  const nearestFloorId = Math.round(displayLevelId);
  const nearestFloor = getDesktopFloorById(nearestFloorId) ?? fromFloor;

  const exteriorOffsetY = computeTowerExteriorOffsetY(
    fromFloor.id,
    toFloor.id,
    displayLevelId,
    direction,
  );

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

  const arrived = phase === 'arrived' || phase === 'opening';
  const exiting = phase === 'exiting';
  const traveling = phase === 'traveling';

  const rightGlassX = 1 - TOWER_SHELL_GLASS_RIGHT.right / 100 - TOWER_SHELL_GLASS_RIGHT.width / 100;

  return (
    <div
      className={`desktop-tower-elevator ${exiting ? 'desktop-tower-elevator--exiting' : ''} ${arrived ? 'desktop-tower-elevator--arrived' : ''}`}
      role="dialog"
      aria-label={`Elevator traveling ${direction} to ${toFloor.name}`}
      aria-live="polite"
    >
      <svg className="desktop-tower-elevator__svg-defs" aria-hidden>
        <defs>
          <clipPath id="tower-glass-clip" clipPathUnits="objectBoundingBox">
            <rect
              x={TOWER_SHELL_GLASS_REAR.left / 100}
              y={TOWER_SHELL_GLASS_REAR.top / 100}
              width={TOWER_SHELL_GLASS_REAR.width / 100}
              height={TOWER_SHELL_GLASS_REAR.height / 100}
            />
            <rect
              x={TOWER_SHELL_GLASS_LEFT.left / 100}
              y={TOWER_SHELL_GLASS_LEFT.top / 100}
              width={TOWER_SHELL_GLASS_LEFT.width / 100}
              height={TOWER_SHELL_GLASS_LEFT.height / 100}
            />
            <rect
              x={rightGlassX}
              y={TOWER_SHELL_GLASS_RIGHT.top / 100}
              width={TOWER_SHELL_GLASS_RIGHT.width / 100}
              height={TOWER_SHELL_GLASS_RIGHT.height / 100}
            />
          </clipPath>
          <mask id="tower-shell-frame-mask" maskContentUnits="objectBoundingBox">
            <rect width="1" height="1" fill="white" />
            <rect
              x={TOWER_SHELL_GLASS_REAR.left / 100}
              y={TOWER_SHELL_GLASS_REAR.top / 100}
              width={TOWER_SHELL_GLASS_REAR.width / 100}
              height={TOWER_SHELL_GLASS_REAR.height / 100}
              fill="black"
            />
            <rect
              x={TOWER_SHELL_GLASS_LEFT.left / 100}
              y={TOWER_SHELL_GLASS_LEFT.top / 100}
              width={TOWER_SHELL_GLASS_LEFT.width / 100}
              height={TOWER_SHELL_GLASS_LEFT.height / 100}
              fill="black"
            />
            <rect
              x={rightGlassX}
              y={TOWER_SHELL_GLASS_RIGHT.top / 100}
              width={TOWER_SHELL_GLASS_RIGHT.width / 100}
              height={TOWER_SHELL_GLASS_RIGHT.height / 100}
              fill="black"
            />
          </mask>
        </defs>
      </svg>

      <div className="desktop-tower-elevator__shell">
        {/* Moving exterior — visible only through glass clip */}
        <div className="desktop-tower-elevator__glass-clip">
          <div
            className="desktop-tower-elevator__exterior-track"
            style={{ transform: `translate3d(0, ${exteriorOffsetY}px, 0)` }}
          >
            <div className="desktop-tower-elevator__exterior-sky" />
            <div className="desktop-tower-elevator__exterior-horizon" />
            <div className="desktop-tower-elevator__exterior-tower" />
            <div className="desktop-tower-elevator__exterior-facade-lines" aria-hidden />
          </div>
        </div>

        {/* Static elevator shell — never animated */}
        <img
          src={DESKTOP_TOWER_ELEVATOR_SHELL_URL}
          alt=""
          className="desktop-tower-elevator__shell-img"
          draggable={false}
          width={DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH}
          height={DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT}
          style={{ WebkitMask: 'url(#tower-shell-frame-mask)', mask: 'url(#tower-shell-frame-mask)' }}
        />

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
