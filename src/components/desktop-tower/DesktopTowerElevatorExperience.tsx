import { useEffect, useMemo, useRef, useState } from 'react';
import { getDesktopFloorById, type DesktopFloor } from '../../constants/desktopFloors';
import {
  DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT,
  DESKTOP_TOWER_ELEVATOR_SHELL_URL,
  DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH,
} from '../../constants/desktopTowerEnv';
import { TOWER_SHELL_HOLO } from '../../constants/desktopTowerElevatorLayout';
import { formatTowerLevelLabel, formatTowerElevatorHoloName, type TowerTravelDirection } from '../../constants/desktopTowerMotion';
import {
  cancelElevatorVideoTransition,
  resolveDesktopTowerElevatorVideoSrc,
  runElevatorVideoPlaybackPlan,
  warmDesktopTowerElevatorVideo,
} from '../../utils/desktopTowerElevatorVideo';
import type { ElevatorPlaybackPlan } from '../../utils/elevatorPlaybackPlan';
import { isPhoneDesktopArtboardActive } from '../../hooks/useDesktopArtboardPortalTarget';
import './DesktopTowerElevator.css';

export type TowerElevatorPhase = 'boarding' | 'traveling' | 'arrived' | 'opening' | 'exiting';

type Props = {
  fromFloor: DesktopFloor;
  toFloor: DesktopFloor;
  direction: TowerTravelDirection;
  phase: TowerElevatorPhase;
  displayLevelId: number;
  cabinFloorId: number;
  playbackPlan: ElevatorPlaybackPlan;
  onDoorOpenStart?: () => void;
  onVideoPlaybackComplete?: () => void;
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
  playbackPlan,
  onDoorOpenStart,
  onVideoPlaybackComplete,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRunRef = useRef(0);
  const lockedVideoSrcRef = useRef(resolveDesktopTowerElevatorVideoSrc(direction));
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  /**
   * Keep the latest completion callback in a ref so the playback effect does NOT
   * depend on its (per-render) identity. The provider re-renders every animation
   * frame during travel; depending on the callback would tear down and restart
   * the video each frame — freezing the animation and preventing completion.
   */
  const onVideoPlaybackCompleteRef = useRef(onVideoPlaybackComplete);
  useEffect(() => {
    onVideoPlaybackCompleteRef.current = onVideoPlaybackComplete;
  }, [onVideoPlaybackComplete]);

  const onDoorOpenStartRef = useRef(onDoorOpenStart);
  useEffect(() => {
    onDoorOpenStartRef.current = onDoorOpenStart;
  }, [onDoorOpenStart]);

  const cabinFloor = getDesktopFloorById(cabinFloorId) ?? fromFloor;
  const isAtDestination = phase === 'traveling' && cabinFloorId === toFloor.id;
  const isAtIntermediate =
    phase === 'traveling' && cabinFloorId !== toFloor.id && cabinFloorId !== fromFloor.id;

  const holo = useMemo((): HoloState => {
    if (phase === 'boarding') {
      return {
        kicker: 'Boarding',
        level: formatTowerLevelLabel(fromFloor),
        name: formatTowerElevatorHoloName(fromFloor),
        accent: true,
      };
    }
    if (phase === 'traveling') {
      if (isAtDestination) {
        return {
          kicker: 'Destination',
          level: formatTowerLevelLabel(toFloor),
          name: formatTowerElevatorHoloName(toFloor),
          accent: true,
        };
      }
      if (isAtIntermediate) {
        return {
          kicker: direction === 'up' ? 'Ascending' : 'Descending',
          level: formatTowerLevelLabel(cabinFloor),
          name: formatTowerElevatorHoloName(cabinFloor),
          accent: true,
        };
      }
      return {
        kicker: direction === 'up' ? 'Ascending' : 'Descending',
        level: formatTowerLevelLabel(toFloor),
        name: formatTowerElevatorHoloName(toFloor),
        accent: true,
      };
    }
    return {
      kicker: 'Destination',
      level: formatTowerLevelLabel(toFloor),
      name: formatTowerElevatorHoloName(toFloor),
      accent: true,
    };
  }, [cabinFloor, direction, fromFloor, isAtDestination, isAtIntermediate, phase, toFloor]);

  useEffect(() => {
    warmDesktopTowerElevatorVideo();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return undefined;

    let cancelled = false;

    const markReady = () => {
      if (!cancelled) setVideoReady(true);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
    }

    video.addEventListener('canplaythrough', markReady);
    video.addEventListener('loadeddata', markReady);

    return () => {
      cancelled = true;
      video.removeEventListener('canplaythrough', markReady);
      video.removeEventListener('loadeddata', markReady);
    };
  }, [videoFailed]);

  useEffect(() => {
    if (phase !== 'traveling' || videoFailed || !videoReady) return undefined;

    const video = videoRef.current;
    if (!video) return undefined;

    const runId = playbackRunRef.current + 1;
    playbackRunRef.current = runId;
    setVideoPlaying(true);

    const lockedSrc = playbackPlan.videoSrc || resolveDesktopTowerElevatorVideoSrc(direction);
    lockedVideoSrcRef.current = lockedSrc;

    void runElevatorVideoPlaybackPlan(video, { ...playbackPlan, videoSrc: lockedSrc }, {
      onDoorOpenStart: () => onDoorOpenStartRef.current?.(),
    })
      .then(() => {
        if (playbackRunRef.current !== runId) return;
        onVideoPlaybackCompleteRef.current?.();
      })
      .catch((error: unknown) => {
        if (playbackRunRef.current !== runId) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setVideoFailed(true);
        onVideoPlaybackCompleteRef.current?.();
      });

    return () => {
      playbackRunRef.current += 1;
      cancelElevatorVideoTransition(video);
      setVideoPlaying(false);
    };
  }, [direction, phase, playbackPlan, videoFailed, videoReady]);

  useEffect(() => {
    if (phase === 'boarding' || phase === 'traveling') return;
    const video = videoRef.current;
    if (video) cancelElevatorVideoTransition(video);
    setVideoPlaying(false);
  }, [phase]);

  const exiting = phase === 'exiting';
  const showVideo = videoReady && !videoFailed;
  const showPoster = !showVideo || !videoPlaying;
  const phoneArtboard = isPhoneDesktopArtboardActive();

  return (
    <div
      className={[
        'desktop-tower-elevator',
        exiting ? 'desktop-tower-elevator--exiting' : '',
        phoneArtboard ? 'desktop-tower-elevator--phone-artboard' : '',
      ]
        .filter(Boolean)
        .join(' ')}
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
          <>
            {showPoster ? (
              <img
                src={DESKTOP_TOWER_ELEVATOR_SHELL_URL}
                alt=""
                className="desktop-tower-elevator__shell-media desktop-tower-elevator__shell-media--poster"
                draggable={false}
                width={DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH}
                height={DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT}
              />
            ) : null}
            <video
              ref={videoRef}
              src={playbackPlan.videoSrc || resolveDesktopTowerElevatorVideoSrc(direction)}
              className={`desktop-tower-elevator__shell-media${
                videoPlaying ? ' desktop-tower-elevator__shell-media--playing' : ''
              }`}
              playsInline
              muted
              loop={false}
              preload="auto"
              draggable={false}
              width={DESKTOP_TOWER_ELEVATOR_SHELL_WIDTH}
              height={DESKTOP_TOWER_ELEVATOR_SHELL_HEIGHT}
              onError={() => {
                setVideoFailed(true);
                onVideoPlaybackCompleteRef.current?.();
              }}
            />
          </>
        )}

        <div
          className={`desktop-tower-elevator__holo ${holo.accent ? 'desktop-tower-elevator__holo--accent' : ''}`}
          style={{ top: `${TOWER_SHELL_HOLO.top}%`, width: `${TOWER_SHELL_HOLO.width}%` }}
        >
          {import.meta.env.DEV ? (
            <div
              className="desktop-tower-elevator__debug-plan"
              aria-hidden
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: 4,
                fontFamily: 'monospace',
                fontSize: 9,
                lineHeight: 1.35,
                textAlign: 'left',
                color: '#111',
                background: 'rgba(255,255,255,0.88)',
                border: '1px solid rgba(0,0,0,0.2)',
                padding: '4px 6px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              F{playbackPlan.currentFloor}→F{playbackPlan.destinationFloor} · {playbackPlan.direction} ·
              Δ{playbackPlan.floorsTraveled} · travel {playbackPlan.travelDurationMs}ms · doors{' '}
              {playbackPlan.doorOpenStart.toFixed(2)}–{playbackPlan.doorOpenEnd.toFixed(2)}s
            </div>
          ) : null}
          <div className="desktop-tower-elevator__holo-label">{holo.kicker}</div>
          <div className="desktop-tower-elevator__holo-level">{holo.level}</div>
          <div className="desktop-tower-elevator__holo-name">{holo.name}</div>
        </div>
      </div>
    </div>
  );
}
