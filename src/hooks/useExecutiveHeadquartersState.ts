import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ensureExecutiveHeadquartersSubsystem,
  getExecutiveHeadquartersPlatformStats,
  getExecutiveHeadquartersReadyView,
  openExecutiveHeadquartersRoom,
  listHeadquartersNavigationRooms,
  recordHeadquartersOpened,
  resolveHeadquartersRoomFromSlug,
  buildHeadquartersRoomPath,
  type HqRoomId,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useExecutiveHeadquartersState(roomSlug?: string) {
  const [tick, setTick] = useState(0);
  const openedRef = useRef(false);

  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureExecutiveHeadquartersSubsystem();
    if (!openedRef.current) {
      openedRef.current = true;
      recordHeadquartersOpened();
    }
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const onUpdate = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => refresh(), 120);
    };
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    };
  }, [refresh]);

  const activeRoomId = useMemo(
    () => resolveHeadquartersRoomFromSlug(roomSlug),
    [roomSlug, tick]
  );

  const view = useMemo(
    () => getExecutiveHeadquartersReadyView(activeRoomId),
    [activeRoomId, tick]
  );

  const stats = useMemo(() => getExecutiveHeadquartersPlatformStats(), [tick]);
  const navigationRooms = useMemo(() => listHeadquartersNavigationRooms(), [tick]);

  const enterRoom = useCallback(
    (roomId: HqRoomId) => {
      openExecutiveHeadquartersRoom(roomId);
      refresh();
      return buildHeadquartersRoomPath(roomId);
    },
    [refresh]
  );

  return {
    view,
    stats,
    navigationRooms,
    activeRoomId,
    enterRoom,
    refresh,
    tick,
  };
}
