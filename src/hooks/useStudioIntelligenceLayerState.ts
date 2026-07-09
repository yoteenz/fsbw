import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ensureStudioIntelligenceLayerSubsystem,
  getStudioIntelligenceLayerReadyView,
  updateIntelligencePlaygroundSelection,
  GENESIS_UPDATED_EVENT,
  type XsilPlaygroundSelection,
  type XsilRoomPath,
} from '../studio-os-core/genesis';

export function useStudioIntelligenceLayerState() {
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [playgroundOverride, setPlaygroundOverride] = useState<Partial<XsilPlaygroundSelection>>({});

  const refresh = useCallback(() => {
    ensureStudioIntelligenceLayerSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureStudioIntelligenceLayerSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(
    () =>
      getStudioIntelligenceLayerReadyView({
        pathname: location.pathname,
        playground: playgroundOverride,
      }),
    [location.pathname, playgroundOverride, tick]
  );

  const setCompany = useCallback(
    (partial: Partial<XsilPlaygroundSelection>) => {
      updateIntelligencePlaygroundSelection(partial);
      setPlaygroundOverride((prev) => ({ ...prev, ...partial }));
      refresh();
    },
    [refresh]
  );

  const activeRoom = (location.pathname.split('/').pop() ?? 'studio-intelligence-layer') as XsilRoomPath;

  return { view, activeRoom, setCompany, refresh };
}
