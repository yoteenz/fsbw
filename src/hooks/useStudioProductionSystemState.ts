import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ensureStudioProductionSystemSubsystem,
  getStudioProductionSystemReadyView,
  updateProductionPlaygroundSelection,
  buildProductionPlaygroundPreview,
  GENESIS_UPDATED_EVENT,
  type XpsPlaygroundInput,
  type XpsRoomPath,
} from '../studio-os-core/genesis';

export function useStudioProductionSystemState() {
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [playgroundOverride, setPlaygroundOverride] = useState<Partial<XpsPlaygroundInput>>({});

  const refresh = useCallback(() => {
    ensureStudioProductionSystemSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureStudioProductionSystemSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(
    () =>
      getStudioProductionSystemReadyView({
        pathname: location.pathname,
        playground: playgroundOverride,
        brandId: playgroundOverride.brandId,
      }),
    [location.pathname, playgroundOverride, tick]
  );

  const setPlayground = useCallback(
    (partial: Partial<XpsPlaygroundInput>) => {
      updateProductionPlaygroundSelection(partial);
      setPlaygroundOverride((prev) => ({ ...prev, ...partial }));
      refresh();
    },
    [refresh]
  );

  const runPlaygroundPreview = useCallback(
    (input?: Partial<XpsPlaygroundInput>) => {
      const merged = { ...view.playground, ...playgroundOverride, ...input };
      buildProductionPlaygroundPreview(merged);
      refresh();
    },
    [view.playground, playgroundOverride, refresh]
  );

  const activeRoom = (location.pathname.split('/').pop() ?? 'studio-production') as XpsRoomPath;

  return { view, activeRoom, setPlayground, runPlaygroundPreview, refresh };
}
