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

function holdElevatorVideoLastFrame(video: HTMLVideoElement): void {
  video.pause();
  video.loop = false;
  if (!Number.isFinite(video.duration) || video.duration <= 0) return;
  video.currentTime = Math.max(0, video.duration - 1 / 30);
}

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
  const [lockedVideoSrc] = useState(() => getDesktopTowerElevatorVideoSrc());

  const cabinFloor = getDesktopFloorById(cabinFloorId) ?? fromFloor;
  const isAtDestination = phase === 'traveling' && cabinFloorId === toFloor.id;
  const isAtIntermediate =
    phase === 'traveling' && cabinFloorId !== toFloor.id && cabinFloorId !== fromFloor.id;

  const holo = useMemo((): HoloState => {
    if (phase === 'boarding') {
      return {
        kicker: 'Boarding',
        level: formatTowerLevelLabel(fromFloor),
        name: fromFloor.name,
        accent: true,
      };
    }
    if (phase === 'traveling') {
      if (isAtDestination) {
        return {
          kicker: 'Destination',
          level: formatTowerLevelLabel(toFloor),
          name: toFloor.name,
          accent: true,
        };
      }
      if (isAtIntermediate) {
        return {
          kicker: direction === 'up' ? 'Ascending' : 'Descending',
          level: formatTowerLevelLabel(cabinFloor),
          name: cabinFloor.name,
          accent: true,
        };
      }
      return {
        kicker: direction === 'up' ? 'Ascending' : 'Descending',
        level: formatTowerLevelLabel(toFloor),
        name: toFloor.name,
        accent: true,
      };
    }
    return {
      kicker: 'Destination',
      level: formatTowerLevelLabel(toFloor),
      name: toFloor.name,
      accent: true,
    };
  }, [cabinFloor, direction, fromFloor, isAtDestination, isAtIntermediate, phase, toFloor]);

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
      lockedVideoSrc,
    );
  }, [direction, fromFloor.id, lockedVideoSrc, toFloor.id, videoFailed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return undefined;

    const handleEnded = () => {
      if (phase === 'boarding' || phase === 'traveling') {
        holdElevatorVideoLastFrame(video);
      }
    };

    video.loop = false;
    video.addEventListener('ended', handleEnded);

    const shouldPlay = phase === 'boarding' || phase === 'traveling';
    if (!shouldPlay) {
      video.pause();
      return () => video.removeEventListener('ended', handleEnded);
    }

    if (!video.ended && video.paused) {
      void video.play().catch(() => setVideoFailed(true));
    }

    return () => video.removeEventListener('ended', handleEnded);
  }, [phase, videoFailed]);

  const exiting = phase === 'exiting';

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
            key={`${fromFloor.id}-${toFloor.id}-${direction}`}
            src={lockedVideoSrc}
            poster={videoPlaying ? undefined : DESKTOP_TOWER_ELEVATOR_SHELL_URL}
            className={`desktop-tower-elevator__shell-media${
              videoPlaying ? ' desktop-tower-elevator__shell-media--playing' : ''
            }`}
            playsInline
            muted
            loop={false}
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
        </div>
      </div>
    </div>
  );
}
