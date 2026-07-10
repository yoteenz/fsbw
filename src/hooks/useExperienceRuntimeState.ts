import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  buildExperienceRuntimeReadyView,
  ensureExperienceRuntimeSubsystem,
  recordExperienceRuntimeOpened,
  updateRuntimeSelectionStore,
  type XerRuntimeSelection,
  type XerRoomPath,
} from '../studio-os-core/genesis';

export function useExperienceRuntimeState() {
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [selectionOverride, setSelectionOverride] = useState<Partial<XerRuntimeSelection>>({});

  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureExperienceRuntimeSubsystem();
    recordExperienceRuntimeOpened();
  }, []);

  const view = useMemo(
    () =>
      buildExperienceRuntimeReadyView({
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
