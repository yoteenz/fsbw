import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ensureExperienceRuntimeSubsystem,
  getExperienceRuntimeReadyView,
  updateRuntimeSelectionStore,
  GENESIS_UPDATED_EVENT,
  type XerRuntimeSelection,
  type XerRoomPath,
} from '../studio-os-core/genesis';

export function useExperienceRuntimeState() {
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [selectionOverride, setSelectionOverride] = useState<Partial<XerRuntimeSelection>>({});

  const refresh = useCallback(() => {
    ensureExperienceRuntimeSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureExperienceRuntimeSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(
    () =>
      getExperienceRuntimeReadyView({
        pathname: location.pathname,
        selection: selectionOverride,
      }),
    [location.pathname, selectionOverride, tick]
  );

  const setSelection = useCallback(
    (partial: Partial<XerRuntimeSelection>) => {
      updateRuntimeSelectionStore(partial);
      setSelectionOverride((prev) => ({ ...prev, ...partial }));
      refresh();
    },
    [refresh]
  );

  const activeRoom = (location.pathname.split('/').pop() ?? 'experience-runtime') as XerRoomPath;

  return { view, activeRoom, setSelection, refresh };
}
