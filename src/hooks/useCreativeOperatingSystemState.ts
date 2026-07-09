import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ensureCreativeOperatingSystemSubsystem,
  getCreativeOperatingSystemReadyView,
  recordFounderBoardDecision,
  runPostPublicationEvolution,
  searchCreativeMemory,
  GENESIS_UPDATED_EVENT,
  type XcosDemoBrandId,
  type XcosFounderDecision,
  type XcosRoomPath,
} from '../studio-os-core/genesis';

export function useCreativeOperatingSystemState() {
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [brandOverride, setBrandOverride] = useState<XcosDemoBrandId | undefined>();

  const refresh = useCallback(() => {
    ensureCreativeOperatingSystemSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureCreativeOperatingSystemSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(
    () =>
      getCreativeOperatingSystemReadyView({
        pathname: location.pathname,
        brandId: brandOverride,
      }),
    [location.pathname, brandOverride, tick]
  );

  const setBrand = useCallback(
    (brandId: XcosDemoBrandId) => {
      setBrandOverride(brandId);
      refresh();
    },
    [refresh]
  );

  const decideMeeting = useCallback(
    (meetingId: string, decision: XcosFounderDecision, rationale?: string) => {
      recordFounderBoardDecision(meetingId, decision, rationale);
      refresh();
    },
    [refresh]
  );

  const searchMemory = useCallback(
    (query: string) => searchCreativeMemory(query, brandOverride ?? view.activeBrandId),
    [brandOverride, view.activeBrandId]
  );

  const activeRoom = (location.pathname.split('/').pop() ?? 'creative-operating-system') as XcosRoomPath;

  return { view, activeRoom, setBrand, decideMeeting, searchMemory, runEvolution: runPostPublicationEvolution, refresh };
}
