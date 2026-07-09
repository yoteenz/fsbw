import { useCallback, useEffect, useState } from 'react';
import {
  runStudioBootstrap,
  getInitialStudioBootstrapLiveState,
  getStudioBootstrapLiveState,
  STUDIO_BOOT_EVENT,
  resetStudioBootstrap,
  type StudioBootLiveState,
} from '../studio-os-core/bootstrap';
import {
  runtimeReadinessEngine,
  type RuntimeReadinessSnapshot,
} from '../studio-os-core/runtime-readiness';

export function useStudioBoot(through: 'experience-runtime' | 'ui-render' = 'experience-runtime') {
  const [live, setLive] = useState<StudioBootLiveState>(() => getInitialStudioBootstrapLiveState());
  const [readiness, setReadiness] = useState<RuntimeReadinessSnapshot | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [safeMode, setSafeMode] = useState(false);

  const syncLive = useCallback(() => {
    const cached = getStudioBootstrapLiveState();
    if (cached) setLive(cached);
  }, []);

  const run = useCallback(
    async (opts?: { force?: boolean; safe?: boolean; skipModuleIds?: string[] }) => {
      setFatalError(null);
      if (opts?.force) resetStudioBootstrap();
      if (opts?.safe) setSafeMode(true);
      setLive(getInitialStudioBootstrapLiveState());

      try {
        const report = await runStudioBootstrap({
          through,
          force: true,
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

  useEffect(() => {
    void run({ force: true });
  }, [run]);

  useEffect(() => {
    const onBoot = (event: Event) => {
      const detail = (event as CustomEvent<StudioBootLiveState>).detail;
      if (detail) setLive(detail);
    };
    window.addEventListener(STUDIO_BOOT_EVENT, onBoot);
    return () => window.removeEventListener(STUDIO_BOOT_EVENT, onBoot);
  }, []);

  useEffect(() => {
    if (live.complete) return;
    const timer = window.setInterval(() => {
      const cached = getStudioBootstrapLiveState();
      if (cached) setLive(cached);
    }, 100);
    return () => clearInterval(timer);
  }, [live.complete]);

  const skipCurrentModule = useCallback(() => {
    const stuck = live.currentModuleId ?? live.modules.find((m) => m.status === 'loading')?.id;
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
