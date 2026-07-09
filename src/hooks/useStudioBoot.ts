import { useCallback, useLayoutEffect, useState } from 'react';
import {
  runStudioBootstrap,
  getInitialStudioBootstrapLiveState,
  getStudioBootstrapLiveState,
  resetStudioBootstrap,
  type StudioBootLiveState,
} from '../studio-os-core/bootstrap';
import {
  clearStudioBootstrapOrchestrator,
  ensureStudioBootstrapStarted,
  subscribeStudioBoot,
} from '../studio-os-core/bootstrap/studio-bootstrap-init';
import {
  runtimeReadinessEngine,
  type RuntimeReadinessSnapshot,
} from '../studio-os-core/runtime-readiness';

export function useStudioBoot(through: 'experience-runtime' | 'ui-render' = 'experience-runtime') {
  const [live, setLive] = useState<StudioBootLiveState>(() => {
    const cached = getStudioBootstrapLiveState();
    return cached ?? getInitialStudioBootstrapLiveState();
  });
  const [readiness, setReadiness] = useState<RuntimeReadinessSnapshot | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [safeMode, setSafeMode] = useState(false);

  const syncLive = useCallback(() => {
    const cached = getStudioBootstrapLiveState();
    if (cached) setLive(cached);
  }, []);

  useLayoutEffect(() => {
    const unsub = subscribeStudioBoot(setLive);
    void ensureStudioBootstrapStarted({ through });
    return unsub;
  }, [through]);

  const run = useCallback(
    async (opts?: { force?: boolean; safe?: boolean; skipModuleIds?: string[] }) => {
      setFatalError(null);
      if (opts?.force) {
        clearStudioBootstrapOrchestrator();
        resetStudioBootstrap();
      }
      if (opts?.safe) setSafeMode(true);

      try {
        const report = await runStudioBootstrap({
          through,
          force: opts?.force ?? false,
          allowReset: opts?.force ?? false,
          safeMode: opts?.safe ?? safeMode,
          skipModuleIds: opts?.skipModuleIds,
        });
        syncLive();
        const snap = await runtimeReadinessEngine.ensureReady(true);
        setReadiness(snap);
        if (!snap.bootReady) {
          setFatalError(snap.errors[0] ?? 'Boot incomplete');
        }
        return report;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setFatalError(msg);
        syncLive();
        return null;
      }
    },
    [through, safeMode, syncLive]
  );

  useLayoutEffect(() => {
    if (!live.complete) return;
    void runtimeReadinessEngine.ensureReady(true).then(setReadiness);
  }, [live.complete]);

  const skipCurrentModule = useCallback(() => {
    const stuck =
      live.currentModuleId ??
      live.modules.find((m) => m.status === 'starting' || m.status === 'running')?.id;
    void run({ force: true, safe: safeMode, skipModuleIds: stuck ? [stuck] : [] });
  }, [live, run, safeMode]);

  return {
    live,
    readiness,
    fatalError,
    safeMode,
    retry: () => run({ force: true, safe: false }),
    continueSafeMode: () => run({ force: true, safe: true }),
    skipCurrentModule,
  };
}
