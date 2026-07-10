import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  buildExperienceEngineReadyView,
  ensureExperienceEngineDnaSubsystem,
  recordExperienceEngineOpened,
  updatePlaygroundSelection,
  type XeePlaygroundSelection,
  type XeeRoomPath,
} from '../studio-os-core/genesis';

export function useExperienceEngineDnaState() {
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [playgroundOverride, setPlaygroundOverride] = useState<Partial<XeePlaygroundSelection>>({});

  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureExperienceEngineDnaSubsystem();
    recordExperienceEngineOpened();
  }, []);

  const view = useMemo(
    () =>
      buildExperienceEngineReadyView({
        pathname: location.pathname,
        playground: playgroundOverride,
      }),
    [location.pathname, playgroundOverride, tick]
  );

  const setPlayground = useCallback(
    (partial: Partial<XeePlaygroundSelection>) => {
      updatePlaygroundSelection(partial);
      setPlaygroundOverride((prev) => ({ ...prev, ...partial }));
      refresh();
    },
    [refresh]
  );

  const activeRoom = (location.pathname.split('/').pop() ?? 'experience-engine') as XeeRoomPath;

  return { view, activeRoom, setPlayground, refresh };
}
