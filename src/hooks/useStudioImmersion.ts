import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  buildChiefConciergeBrief,
  getActiveScreenMoment,
  getPresenceActivity,
  getPresenceActivities,
  resolveStudioRoomVariant,
} from '../studio-os-core/studio-immersion/engine';

export function useStudioImmersion() {
  const { pathname } = useLocation();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 7000);
    return () => window.clearInterval(id);
  }, []);

  const roomVariant = useMemo(() => resolveStudioRoomVariant(pathname), [pathname]);
  const chiefBrief = useMemo(() => buildChiefConciergeBrief(pathname), [pathname]);
  const screenMoment = useMemo(() => getActiveScreenMoment(pathname), [pathname]);
  const primaryPresence = useMemo(() => getPresenceActivity(tick), [tick]);
  const presenceFeed = useMemo(() => getPresenceActivities(4, tick), [tick]);

  return {
    pathname,
    roomVariant,
    chiefBrief,
    screenMoment,
    primaryPresence,
    presenceFeed,
    tick,
  };
}
