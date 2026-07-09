import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ensureBrandDiscoveryEngineSubsystem,
  getBrandDiscoveryEngineReadyView,
  updateBrandDiscoveryPlaygroundSelection,
  GENESIS_UPDATED_EVENT,
  type XbdPlaygroundSelection,
  type XbdRoomPath,
} from '../studio-os-core/genesis';

export function useBrandDiscoveryEngineState() {
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [playgroundOverride, setPlaygroundOverride] = useState<Partial<XbdPlaygroundSelection>>({});

  const refresh = useCallback(() => {
    ensureBrandDiscoveryEngineSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureBrandDiscoveryEngineSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(
    () =>
      getBrandDiscoveryEngineReadyView({
        pathname: location.pathname,
        playground: playgroundOverride,
      }),
    [location.pathname, playgroundOverride, tick]
  );

  const setPlayground = useCallback(
    (partial: Partial<XbdPlaygroundSelection>) => {
      updateBrandDiscoveryPlaygroundSelection(partial);
      setPlaygroundOverride((prev) => ({ ...prev, ...partial }));
      refresh();
    },
    [refresh]
  );

  const activeRoom = (location.pathname.split('/').pop() ?? 'brand-discovery-engine') as XbdRoomPath;

  return { view, activeRoom, setPlayground, refresh };
}
