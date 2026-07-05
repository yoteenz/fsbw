import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { bootstrapLivingHeadquartersPresencePlatform } from '../studio-os-core/living-headquarters-presence/bootstrap';
import {
  getDockIdleActivity,
  getMicroMomentLabel,
  getOrganizationalMoments,
  getTimePhase,
  getTimePhaseLabel,
  enrichPresenceActivity,
} from '../studio-os-core/living-headquarters-presence/engine';
import {
  checkFounderArrival,
  dismissOrganizationalMoment,
  readLivingPresenceStore,
} from '../studio-os-core/living-headquarters-presence/store';
import { getPresenceActivity } from '../studio-os-core/studio-immersion/engine';

export function useLivingHeadquartersPresence() {
  const { pathname } = useLocation();
  const [tick, setTick] = useState(0);
  const [idleIndex, setIdleIndex] = useState(0);
  const [arrival, setArrival] = useState<ReturnType<typeof checkFounderArrival>['arrival']>(null);

  useEffect(() => {
    bootstrapLivingHeadquartersPresencePlatform();
    const result = checkFounderArrival();
    setArrival(result.arrival);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setIdleIndex((i) => i + 1), 8000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 7000);
    return () => window.clearInterval(id);
  }, []);

  const timePhase = useMemo(() => getTimePhase(), [tick]);
  const store = readLivingPresenceStore();

  const dockIdleActivity = useMemo(
    () => getDockIdleActivity(idleIndex, timePhase),
    [idleIndex, timePhase]
  );

  const organizationalMoments = useMemo(() => {
    return getOrganizationalMoments(pathname, timePhase).filter(
      (m) => !store.dismissedMomentIds.includes(m.id)
    ).slice(0, 3);
  }, [pathname, timePhase, store.dismissedMomentIds, tick]);

  const presence = useMemo(() => enrichPresenceActivity(getPresenceActivity(tick)), [tick]);

  const dismissMoment = useCallback((id: string) => {
    dismissOrganizationalMoment(id);
    setTick((t) => t + 1);
  }, []);

  const getMicroMoment = useCallback((index: number) => getMicroMomentLabel(index), []);

  return {
    timePhase,
    timePhaseLabel: getTimePhaseLabel(timePhase),
    ambientTimeClass: `studio-time-${timePhase}`,
    dockIdleActivity,
    organizationalMoments,
    presence,
    morningArrival: arrival,
    dismissMoment,
    getMicroMoment,
    tick,
  };
}
