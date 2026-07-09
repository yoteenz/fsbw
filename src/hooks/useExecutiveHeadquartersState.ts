import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureExecutiveHeadquartersSubsystem,
  getExecutiveHeadquartersPlatformStats,
  getExecutiveHeadquartersReadyView,
  openExecutiveHeadquartersRoom,
  listHeadquartersNavigationRooms,
  resolveHeadquartersRoomFromSlug,
  buildHeadquartersRoomPath,
  type HqRoomId,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useExecutiveHeadquartersState(roomSlug?: string) {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureExecutiveHeadquartersSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureExecutiveHeadquartersSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
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
