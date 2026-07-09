import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  archiveExecutiveSession,
  buildAnnualSummitCapsule,
  buildQuarterlyRetreatPacket,
  buildSessionOutputs,
  ensureExecutiveReflectionSuiteSubsystem,
  getExecutiveReflectionSuiteReadyView,
  startExecutiveSession,
  type ErsSessionType,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useExecutiveReflectionSuiteState(founderDisplayName = 'Founder') {
  const location = useLocation();
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureExecutiveReflectionSuiteSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureExecutiveReflectionSuiteSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(
    () =>
      getExecutiveReflectionSuiteReadyView({
        pathname: location.pathname,
        founderDisplayName,
      }),
    [location.pathname, founderDisplayName, tick]
  );

  const beginSession = useCallback(
    (sessionType: ErsSessionType) => {
      startExecutiveSession(sessionType, view.activeRoom, founderDisplayName);
      refresh();
    },
    [view.activeRoom, founderDisplayName, refresh]
  );

  const generateOutputs = useCallback(() => {
    return buildSessionOutputs('executive-review', founderDisplayName);
  }, [founderDisplayName]);

  const archiveSession = useCallback(() => {
    const session = view.activeSession;
    if (!session) return;
    archiveExecutiveSession(session.sessionId);
    refresh();
  }, [view.activeSession, refresh]);

  const prepareSummit = useCallback(() => {
    buildAnnualSummitCapsule(founderDisplayName);
    refresh();
  }, [founderDisplayName, refresh]);

  const prepareRetreat = useCallback(() => {
    buildQuarterlyRetreatPacket();
    refresh();
  }, [refresh]);

  return {
    view,
    beginSession,
    generateOutputs,
    archiveSession,
    prepareSummit,
    prepareRetreat,
    refresh,
  };
}
