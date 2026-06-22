import { useCallback, useEffect, useState } from 'react';
import {
  DESKTOP_PENTHOUSE_DEFAULT_ROOM_INDEX,
  DESKTOP_PENTHOUSE_ROOMS,
  getPenthouseRoomIdByIndex,
  resolvePenthouseRoomBackground,
} from '../../constants/desktopPenthouseRooms';
import './DesktopPenthouseRoomScene.css';

const ROOM_TRANSITION_MS = 880;

type RoomBackgroundProps = {
  roomId: string;
  className: string;
};

function RoomBackground({ roomId, className }: RoomBackgroundProps) {
  const [src, setSrc] = useState(() => resolvePenthouseRoomBackground(roomId));

  useEffect(() => {
    setSrc(resolvePenthouseRoomBackground(roomId));
  }, [roomId]);

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={className}
      onError={() => {
        setSrc((current) => {
          const fallback = resolvePenthouseRoomBackground(roomId, { fallback: true });
          return current === fallback ? current : fallback;
        });
      }}
    />
  );
}

type DesktopPenthouseRoomSceneProps = {
  roomIndex: number;
  onRoomIndexChange?: (index: number) => void;
  className?: string;
};

export function DesktopPenthouseRoomScene({
  roomIndex,
  onRoomIndexChange,
  className = '',
}: DesktopPenthouseRoomSceneProps) {
  const [activeIndex, setActiveIndex] = useState(roomIndex);
  const [leavingIndex, setLeavingIndex] = useState<number | null>(null);

  const setRoomIndex = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(DESKTOP_PENTHOUSE_ROOMS.length - 1, next));
      onRoomIndexChange?.(clamped);
    },
    [onRoomIndexChange],
  );

  useEffect(() => {
    if (roomIndex === activeIndex) return;

    setLeavingIndex(activeIndex);
    setActiveIndex(roomIndex);

    const timer = window.setTimeout(() => {
      setLeavingIndex(null);
    }, ROOM_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, roomIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setRoomIndex(roomIndex - 1);
      if (e.key === 'ArrowRight') setRoomIndex(roomIndex + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [roomIndex, setRoomIndex]);

  const activeRoomId = getPenthouseRoomIdByIndex(activeIndex);
  const leavingRoomId = leavingIndex !== null ? getPenthouseRoomIdByIndex(leavingIndex) : null;
  const isTransitioning = leavingIndex !== null;

  return (
    <div className={`penthouse-room-scene ${className}`.trim()} aria-hidden>
      {!isTransitioning ? (
        <div className="penthouse-room-scene__layer">
          <RoomBackground
            roomId={activeRoomId}
            className="penthouse-room-scene__bg penthouse-room-scene__bg--steady"
          />
        </div>
      ) : (
        <>
          {leavingRoomId ? (
            <div className="penthouse-room-scene__layer">
              <RoomBackground
                roomId={leavingRoomId}
                className="penthouse-room-scene__bg penthouse-room-scene__bg--exit"
              />
            </div>
          ) : null}
          <div className="penthouse-room-scene__layer">
            <RoomBackground
              roomId={activeRoomId}
              className="penthouse-room-scene__bg penthouse-room-scene__bg--enter"
            />
          </div>
        </>
      )}
    </div>
  );
}

export { DESKTOP_PENTHOUSE_DEFAULT_ROOM_INDEX };
