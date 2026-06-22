import { useCallback, useEffect } from 'react';
import {
  DESKTOP_PENTHOUSE_DEFAULT_ROOM_INDEX,
  DESKTOP_PENTHOUSE_ROOMS,
  getPenthouseRoomIdByIndex,
  resolvePenthouseRoomBackground,
} from '../../constants/desktopPenthouseRooms';
import { DesktopZoneRoomScene } from './DesktopZoneRoomScene';

const PENTHOUSE_ZONE_IDS = DESKTOP_PENTHOUSE_ROOMS.map((room) => room.id);

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
  const setRoomIndex = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(DESKTOP_PENTHOUSE_ROOMS.length - 1, next));
      onRoomIndexChange?.(clamped);
    },
    [onRoomIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setRoomIndex(roomIndex - 1);
      if (e.key === 'ArrowRight') setRoomIndex(roomIndex + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [roomIndex, setRoomIndex]);

  return (
    <DesktopZoneRoomScene
      zoneIds={PENTHOUSE_ZONE_IDS}
      zoneIndex={roomIndex}
      resolveBackground={(zoneId) => resolvePenthouseRoomBackground(zoneId)}
      resolveFallbackBackground={(zoneId) => resolvePenthouseRoomBackground(zoneId, { fallback: true })}
      className={className}
    />
  );
}

export { DESKTOP_PENTHOUSE_DEFAULT_ROOM_INDEX, getPenthouseRoomIdByIndex };
