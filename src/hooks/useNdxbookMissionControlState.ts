import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bootstrapNdxbookMissionControlStore,
  readNdxbookMissionControlStore,
  reschedulePublishingItem,
  touchMissionControlLiveMetrics,
} from '../studio-os-core/ndxbook/mission-control/store';
import { buildNdxbookMissionControlSeed } from '../studio-os-core/ndxbook/mission-control/bootstrap';
import type { MissionControlNavId } from '../studio-os-core/ndxbook/mission-control/types';

function ensureSeeded(): void {
  bootstrapNdxbookMissionControlStore(buildNdxbookMissionControlSeed());
}

export function useNdxbookMissionControlState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });
  const [now, setNow] = useState(() => new Date());

  const refresh = useCallback(() => {
    ensureSeeded();
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    ensureSeeded();
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    const live = window.setInterval(() => {
      touchMissionControlLiveMetrics();
      setVersion((v) => v + 1);
    }, 45_000);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(live);
    };
  }, []);

  const store = useMemo(() => {
    void version;
    return readNdxbookMissionControlStore();
  }, [version]);

  const rescheduleItem = useCallback((itemId: string, newScheduledAt: string) => {
    reschedulePublishingItem(itemId, newScheduledAt);
    setVersion((v) => v + 1);
  }, []);

  const formatTime = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    []
  );

  const formatDate = useCallback(
    () =>
      now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    [now]
  );

  const formatClock = useCallback(
    () =>
      now.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      }),
    [now]
  );

  const countdownToLaunch = useMemo(() => {
    const target = new Date(store.pageOfTheDay.launchAt).getTime();
    const diff = Math.max(0, target - now.getTime());
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [store.pageOfTheDay.launchAt, now]);

  return {
    store,
    now,
    refresh,
    rescheduleItem,
    formatTime,
    formatDate,
    formatClock,
    countdownToLaunch,
    lastUpdatedAt: store.lastUpdatedAt,
  };
}

export type { MissionControlNavId };
