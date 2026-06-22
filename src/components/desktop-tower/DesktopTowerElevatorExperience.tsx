import { useMemo } from 'react';
import type { DesktopFloor } from '../../constants/desktopFloors';
import type { TowerTravelDirection } from '../../constants/desktopTowerMotion';
import './DesktopTowerElevator.css';

export type TowerElevatorPhase = 'boarding' | 'traveling' | 'arrived' | 'opening' | 'exiting';

type Props = {
  floors: readonly DesktopFloor[];
  fromFloor: DesktopFloor;
  toFloor: DesktopFloor;
  direction: TowerTravelDirection;
  phase: TowerElevatorPhase;
  /** Interpolated level id while traveling (e.g. 2.4). */
  displayLevelId: number;
};

const FLOOR_MARKER_STEP_PX = 72;

function formatLevelLabel(floor: DesktopFloor): string {
  return `LEVEL ${floor.id}`;
}

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
  const activeFloor = floors.find((f) => f.id === nearestFloorId) ?? fromFloor;

  const shaftOffset = useMemo(() => {
    const index = floorsTopToBottom.findIndex((f) => f.id === nearestFloorId);
    const safeIndex = index >= 0 ? index : floorsTopToBottom.findIndex((f) => f.id === fromFloor.id);
    return -safeIndex * FLOOR_MARKER_STEP_PX;
  }, [floorsTopToBottom, nearestFloorId, fromFloor.id]);

  const holo = useMemo(() => {
    if (phase === 'boarding') {
      return { label: 'Current level', value: formatLevelLabel(fromFloor), sub: fromFloor.name };
    }
    if (phase === 'traveling') {
      return {
        label: 'Traveling to',
        value: formatLevelLabel(toFloor),
        sub: toFloor.name,
        accent: true,
      };
    }
    return { label: 'Arrived', value: formatLevelLabel(toFloor), sub: toFloor.name, accent: true };
  }, [phase, fromFloor, toFloor]);

  const travelingClass =
    phase === 'traveling'
      ? direction === 'up'
        ? 'desktop-tower-elevator--traveling-up'
        : 'desktop-tower-elevator--traveling-down'
      : '';

  const doorsOpen = phase === 'opening' || phase === 'exiting';
  const exiting = phase === 'exiting';

  return (
    <div
      className={`desktop-tower-elevator ${travelingClass} ${exiting ? 'desktop-tower-elevator--exiting' : ''}`}
      role="dialog"
      aria-label={`Elevator traveling ${direction} to ${toFloor.name}`}
      aria-live="polite"
    >
      <div className="desktop-tower-elevator__cabin">
        <div className="desktop-tower-elevator__particles" aria-hidden />
        <div className="desktop-tower-elevator__motion" aria-hidden />
        <div className="desktop-tower-elevator__ceiling">
          <div className="desktop-tower-elevator__ceiling-glow" aria-hidden />
        </div>
        <div className="desktop-tower-elevator__glass-left" aria-hidden />
        <div className="desktop-tower-elevator__glass-right" aria-hidden />
        <div className="desktop-tower-elevator__marble-floor" aria-hidden />

        <div className="desktop-tower-elevator__shaft">
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
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="desktop-tower-elevator__floor-level floor-level">
                    {formatLevelLabel(floor)}
                  </span>
                  <span className="desktop-tower-elevator__floor-name floor-name">{floor.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="desktop-tower-elevator__holo">
          <div className="desktop-tower-elevator__holo-label">{holo.label}</div>
          <div
            className={`desktop-tower-elevator__holo-value ${holo.accent ? 'desktop-tower-elevator__holo-value--accent' : ''}`}
          >
            {holo.value}
          </div>
          <div
            className="desktop-tower-elevator__holo-value"
            style={{ fontSize: 11, marginTop: 4, letterSpacing: '0.14em' }}
          >
            {holo.sub}
          </div>
          {phase === 'traveling' ? (
            <div
              className="desktop-tower-elevator__holo-label"
              style={{ marginTop: 8, marginBottom: 0 }}
            >
              {activeFloor.name} · {direction === 'up' ? 'ascending' : 'descending'}
            </div>
          ) : null}
        </div>

        <div className={`desktop-tower-elevator__doors ${doorsOpen ? 'desktop-tower-elevator__doors--open' : ''}`}>
          <div className="desktop-tower-elevator__door desktop-tower-elevator__door--left" />
          <div className="desktop-tower-elevator__door desktop-tower-elevator__door--right" />
        </div>

        <div className="desktop-tower-elevator__chrome-frame" aria-hidden />
      </div>
    </div>
  );
}
