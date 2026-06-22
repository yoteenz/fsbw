import { useMemo } from 'react';
import type { DesktopFloor } from '../../constants/desktopFloors';
import {
  computeTowerExteriorOffsetY,
  computeTowerLightBandOffsetY,
  computeTowerTravelProgress,
} from '../../constants/desktopTowerExterior';
import {
  DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT,
  DESKTOP_TOWER_ELEVATOR_SHELL_URL,
  DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH,
} from '../../constants/desktopTowerEnv';
import {
  TOWER_EXTERIOR_MARKER_STEP_PX,
  TOWER_SHELL_GLASS_LEFT,
  TOWER_SHELL_GLASS_REAR,
  TOWER_SHELL_GLASS_RIGHT,
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

const LIGHT_BANDS = [0, 1, 2, 3, 4] as const;

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

  const travelProgress = computeTowerTravelProgress(fromFloor.id, toFloor.id, displayLevelId);
  const exteriorOffsetY = computeTowerExteriorOffsetY(
    fromFloor.id,
    toFloor.id,
    displayLevelId,
    direction,
  );
  const lightBandOffsetY = computeTowerLightBandOffsetY(exteriorOffsetY);
  const sideParallaxY = exteriorOffsetY * 0.42;

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
  const motionActive = traveling || arrived;

  const travelClass = traveling
    ? direction === 'up'
      ? 'desktop-tower-elevator--travel-up'
      : 'desktop-tower-elevator--travel-down'
    : '';

  const markerTrackHeight = floorsTopToBottom.length * TOWER_EXTERIOR_MARKER_STEP_PX + 280;

  return (
    <div
      className={`desktop-tower-elevator ${travelClass} ${exiting ? 'desktop-tower-elevator--exiting' : ''} ${arrived ? 'desktop-tower-elevator--arrived' : ''}`}
      role="dialog"
      aria-label={`Elevator traveling ${direction} to ${toFloor.name}`}
      aria-live="polite"
    >
      <svg className="desktop-tower-elevator__mask-def" aria-hidden>
        <defs>
          <mask id="tower-shell-frame-mask" maskContentUnits="objectBoundingBox">
            <rect width="1" height="1" fill="white" />
            <rect x={TOWER_SHELL_GLASS_REAR.left / 100} y={TOWER_SHELL_GLASS_REAR.top / 100} width={TOWER_SHELL_GLASS_REAR.width / 100} height={TOWER_SHELL_GLASS_REAR.height / 100} fill="black" />
            <rect x={TOWER_SHELL_GLASS_LEFT.left / 100} y={TOWER_SHELL_GLASS_LEFT.top / 100} width={TOWER_SHELL_GLASS_LEFT.width / 100} height={TOWER_SHELL_GLASS_LEFT.height / 100} fill="black" />
            <rect x={1 - TOWER_SHELL_GLASS_RIGHT.right / 100 - TOWER_SHELL_GLASS_RIGHT.width / 100} y={TOWER_SHELL_GLASS_RIGHT.top / 100} width={TOWER_SHELL_GLASS_RIGHT.width / 100} height={TOWER_SHELL_GLASS_RIGHT.height / 100} fill="black" />
          </mask>
        </defs>
      </svg>

      <div
        className="desktop-tower-elevator__shell"
        style={{ aspectRatio: `${DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH} / ${DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT}` }}
      >
        {/* Moving exterior — rear glass */}
        <div
          className="desktop-tower-elevator__glass desktop-tower-elevator__glass--rear"
          style={{
            left: `${TOWER_SHELL_GLASS_REAR.left}%`,
            top: `${TOWER_SHELL_GLASS_REAR.top}%`,
            width: `${TOWER_SHELL_GLASS_REAR.width}%`,
            height: `${TOWER_SHELL_GLASS_REAR.height}%`,
          }}
        >
          <div
            className="desktop-tower-elevator__exterior-track"
            style={{ transform: `translate3d(0, ${exteriorOffsetY}px, 0)` }}
          >
            <div className="desktop-tower-elevator__exterior-sky" />
            <div className="desktop-tower-elevator__exterior-horizon" />
            <div className="desktop-tower-elevator__exterior-tower" />
            <div className="desktop-tower-elevator__exterior-facade-lines" aria-hidden />

            <div
              className="desktop-tower-elevator__marker-track"
              style={{ height: `${markerTrackHeight}px` }}
            >
              {floorsTopToBottom.map((floor, index) => {
                const isTarget = floor.id === toFloor.id;
                const isPassing = floor.id === nearestFloorId && traveling;
                return (
                  <div
                    key={floor.id}
                    className={[
                      'desktop-tower-elevator__ghost-marker',
                      isTarget && travelProgress > 0.72 ? 'desktop-tower-elevator__ghost-marker--target' : '',
                      isPassing ? 'desktop-tower-elevator__ghost-marker--passing' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ top: `${index * TOWER_EXTERIOR_MARKER_STEP_PX + 40}px` }}
                  >
                    <span className="desktop-tower-elevator__ghost-level">{formatTowerLevelLabel(floor)}</span>
                    <span className="desktop-tower-elevator__ghost-name">{floor.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className={`desktop-tower-elevator__light-bands ${motionActive ? 'desktop-tower-elevator__light-bands--active' : ''}`}
            style={{ transform: `translate3d(0, ${lightBandOffsetY}px, 0)` }}
            aria-hidden
          >
            {LIGHT_BANDS.map((i) => (
              <div
                key={i}
                className="desktop-tower-elevator__light-band"
                style={{ top: `${12 + i * 18}%` }}
              />
            ))}
          </div>

          <div
            className={`desktop-tower-elevator__glass-shimmer ${motionActive ? 'desktop-tower-elevator__glass-shimmer--active' : ''}`}
            aria-hidden
          />
        </div>

        {/* Side glass parallax */}
        {(['left', 'right'] as const).map((side) => {
          const isLeft = side === 'left';
          const g = isLeft ? TOWER_SHELL_GLASS_LEFT : TOWER_SHELL_GLASS_RIGHT;
          return (
            <div
              key={side}
              className={`desktop-tower-elevator__glass desktop-tower-elevator__glass--side desktop-tower-elevator__glass--${side}`}
              style={{
                ...(isLeft ? { left: `${TOWER_SHELL_GLASS_LEFT.left}%` } : { right: `${TOWER_SHELL_GLASS_RIGHT.right}%` }),
                top: `${g.top}%`,
                width: `${g.width}%`,
                height: `${g.height}%`,
              }}
            >
              <div
                className="desktop-tower-elevator__exterior-track desktop-tower-elevator__exterior-track--side"
                style={{ transform: `translate3d(0, ${sideParallaxY}px, 0)` }}
              >
                <div className="desktop-tower-elevator__exterior-sky" />
                <div className="desktop-tower-elevator__exterior-tower desktop-tower-elevator__exterior-tower--side" />
              </div>
              <div
                className={`desktop-tower-elevator__glass-shimmer desktop-tower-elevator__glass-shimmer--side ${motionActive ? 'desktop-tower-elevator__glass-shimmer--active' : ''}`}
                aria-hidden
              />
            </div>
          );
        })}

        {/* Static interior shell frame (glass cutouts) */}
        <img
          src={DESKTOP_TOWER_ELEVATOR_SHELL_URL}
          alt=""
          className="desktop-tower-elevator__shell-frame"
          draggable={false}
          width={DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH}
          height={DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT}
          style={{ mask: 'url(#tower-shell-frame-mask)', WebkitMask: 'url(#tower-shell-frame-mask)' }}
        />

        {/* Arrival veil on rear glass */}
        <div
          className={`desktop-tower-elevator__arrival-veil ${arrived || exiting ? 'desktop-tower-elevator__arrival-veil--open' : ''}`}
          style={{
            left: `${TOWER_SHELL_GLASS_REAR.left}%`,
            top: `${TOWER_SHELL_GLASS_REAR.top}%`,
            width: `${TOWER_SHELL_GLASS_REAR.width}%`,
            height: `${TOWER_SHELL_GLASS_REAR.height}%`,
          }}
          aria-hidden
        />

        {/* Destination display */}
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
