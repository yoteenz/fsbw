import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  buildExperienceEngineReadyView,
  ensureExperienceEngineDnaSubsystem,
  recordExperienceEngineOpened,
  repairExperienceEngineDnaIfNeeded,
  traceExperienceEngineStage,
  clearExperienceEngineStartupTrace,
  updatePlaygroundSelection,
  XEE_SUBSYSTEM_VERSION,
  type XeePlaygroundSelection,
  type XeeRoomPath,
} from '../studio-os-core/genesis';

export function useExperienceEngineDnaState() {
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [playgroundOverride, setPlaygroundOverride] = useState<Partial<XeePlaygroundSelection>>({});
  const [repairReasons, setRepairReasons] = useState<string[]>([]);
  const [bootError, setBootError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    clearExperienceEngineStartupTrace();
    traceExperienceEngineStage('route-match', 'completed', { source: location.pathname });
    traceExperienceEngineStage('lazy-chunk', 'completed', { source: 'AdminStudioExperienceEngine' });
    traceExperienceEngineStage('module-eval', 'completed');
    traceExperienceEngineStage('provider-mount', 'started');

    try {
      traceExperienceEngineStage('persisted-hydration', 'started', {
        source: 'genesis_v1.experienceEngineDna',
        schemaVersion: XEE_SUBSYSTEM_VERSION,
      });
      const repair = repairExperienceEngineDnaIfNeeded();
      if (repair.repaired) {
        setRepairReasons(repair.reasons);
      }
      traceExperienceEngineStage('persisted-hydration', 'completed', { schemaVersion: XEE_SUBSYSTEM_VERSION });

      traceExperienceEngineStage('engine-init', 'started');
      ensureExperienceEngineDnaSubsystem();
      recordExperienceEngineOpened();
      traceExperienceEngineStage('engine-init', 'completed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Experience Engine initialization failed';
      setBootError(message);
      traceExperienceEngineStage('engine-init', 'failed', { error: message });
    }

    traceExperienceEngineStage('provider-mount', 'completed');
  }, [location.pathname]);

  const view = useMemo((): import('../studio-os-core/genesis').XeeReadyView | null => {
    try {
      traceExperienceEngineStage('scene-compile', 'started');
      const built = buildExperienceEngineReadyView({
        pathname: location.pathname,
        playground: playgroundOverride,
      });
      traceExperienceEngineStage('scene-compile', 'completed');
      traceExperienceEngineStage('terminal-render', 'completed');
      setBootError(null);
      return built;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Experience profile compile failed';
      setBootError(message);
      traceExperienceEngineStage('scene-compile', 'failed', { error: message });
      return null;
    }
  }, [location.pathname, playgroundOverride, tick]);

  const bootBlocked =
    view === null ||
    !view.experienceProfile?.brand?.colorSystem?.primary ||
    !view.brands?.length;

  const setPlayground = useCallback(
    (partial: Partial<XeePlaygroundSelection>) => {
      updatePlaygroundSelection(partial);
      setPlaygroundOverride((prev) => ({ ...prev, ...partial }));
      refresh();
    },
    [refresh]
  );

  const activeRoom = (location.pathname.split('/').pop() ?? 'experience-engine') as XeeRoomPath;

  const retryAfterRepair = useCallback(() => {
    setBootError(null);
    setRepairReasons([]);
    refresh();
  }, [refresh]);

  return {
    view,
    activeRoom,
    setPlayground,
    refresh,
    bootBlocked,
    bootError,
    repairReasons,
    retryAfterRepair,
  };
}
