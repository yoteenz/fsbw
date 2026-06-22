import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getDesktopFloorById, type DesktopFloor } from '../../constants/desktopFloors';
import {
  DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT,
  DESKTOP_TOWER_ELEVATOR_SHELL_URL,
  DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH,
} from '../../constants/desktopTowerEnv';
import { TOWER_SHELL_HOLO } from '../../constants/desktopTowerElevatorLayout';
import { formatTowerLevelLabel, type TowerTravelDirection } from '../../constants/desktopTowerMotion';
import {
  bindDesktopTowerElevatorVideoPlayback,
  getDesktopTowerElevatorVideoSrc,
  warmDesktopTowerElevatorVideo,
} from '../../utils/desktopTowerElevatorVideo';
import './DesktopTowerElevator.css';

export type TowerElevatorPhase = 'boarding' | 'traveling' | 'arrived' | 'opening' | 'exiting';

type Props = {
  fromFloor: DesktopFloor;
  toFloor: DesktopFloor;
  direction: TowerTravelDirection;
  phase: TowerElevatorPhase;
  displayLevelId: number;
  cabinFloorId: number;
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
  cabinFloorId,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const cabinFloor = getDesktopFloorById(cabinFloorId) ?? fromFloor;
  const isPassingIntermediate =
    phase === 'traveling' && cabinFloorId !== toFloor.id && cabinFloorId !== fromFloor.id;
  const isArriving = phase === 'traveling' && cabinFloorId === toFloor.id;

  const holo = useMemo((): HoloState => {
    if (phase === 'boarding') {
      return {
        kicker: 'Current level',
        level: formatTowerLevelLabel(fromFloor),
        name: fromFloor.name,
      };
    }
    if (phase === 'traveling') {
      if (isPassingIntermediate) {
        return {
          kicker: 'Passing',
          level: formatTowerLevelLabel(cabinFloor),
          name: cabinFloor.name,
          accent: true,
        };
      }
      if (isArriving) {
        return {
          kicker: 'Arriving',
          level: formatTowerLevelLabel(toFloor),
          name: toFloor.name,
          accent: true,
        };
      }
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
  }, [cabinFloor, fromFloor, isArriving, isPassingIntermediate, phase, toFloor]);

  useEffect(() => {
    warmDesktopTowerElevatorVideo();
  }, []);

  useEffect(() => {
    setVideoFailed(false);
    setVideoPlaying(false);
  }, [direction, fromFloor.id, toFloor.id]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return undefined;

    return bindDesktopTowerElevatorVideoPlayback(
      video,
      direction,
      () => setVideoPlaying(true),
      () => setVideoFailed(true),
    );
  }, [direction, fromFloor.id, toFloor.id, videoFailed]);

  const exiting = phase === 'exiting';
  const traveling = phase === 'traveling';
  const videoSrc = getDesktopTowerElevatorVideoSrc();

  return (
    <div
      className={`desktop-tower-elevator ${exiting ? 'desktop-tower-elevator--exiting' : ''}`}
      role="dialog"
      aria-label={`Elevator traveling to ${toFloor.name}`}
      aria-live="polite"
    >
      <div className="desktop-tower-elevator__shell">
        {videoFailed ? (
          <img
            src={DESKTOP_TOWER_ELEVATOR_SHELL_URL}
            alt=""
            className="desktop-tower-elevator__shell-media"
            draggable={false}
            width={DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH}
            height={DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT}
          />
        ) : (
          <video
            ref={videoRef}
            key={`${fromFloor.id}-${toFloor.id}-${direction}-${videoSrc}`}
            src={videoSrc}
            poster={videoPlaying ? undefined : DESKTOP_TOWER_ELEVATOR_SHELL_URL}
            className={`desktop-tower-elevator__shell-media${
              videoPlaying ? ' desktop-tower-elevator__shell-media--playing' : ''
            }`}
            playsInline
            muted
            loop
            autoPlay
            preload="auto"
            draggable={false}
            width={DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH}
            height={DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT}
            onError={() => setVideoFailed(true)}
          />
        )}

        <div
          className={`desktop-tower-elevator__holo ${holo.accent ? 'desktop-tower-elevator__holo--accent' : ''}`}
          style={{ top: `${TOWER_SHELL_HOLO.top}%`, width: `${TOWER_SHELL_HOLO.width}%` }}
        >
          <div className="desktop-tower-elevator__holo-label">{holo.kicker}</div>
          <div className="desktop-tower-elevator__holo-level">{holo.level}</div>
          <div className="desktop-tower-elevator__holo-name">{holo.name}</div>
          {traveling && !isPassingIntermediate && !isArriving ? (
            <div className="desktop-tower-elevator__holo-counter">
              <span className="desktop-tower-elevator__holo-counter-label">Passing</span>
              <span className="desktop-tower-elevator__holo-counter-value">
                {formatTowerLevelLabel(cabinFloor)} · {cabinFloor.name}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
