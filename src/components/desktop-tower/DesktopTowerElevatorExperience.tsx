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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

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

  useEffect(() => {
    warmDesktopTowerElevatorVideo();
  }, []);

  useEffect(() => {
    setVideoFailed(false);
    setVideoPlaying(false);
  }, [fromFloor.id, toFloor.id]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return undefined;

    return bindDesktopTowerElevatorVideoPlayback(
      video,
      () => setVideoPlaying(true),
      () => setVideoFailed(true),
    );
  }, [fromFloor.id, toFloor.id, videoFailed]);

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
            key={`${fromFloor.id}-${toFloor.id}-${videoSrc}`}
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
