import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getInitialStudioBootstrapLiveState,
  getStudioBootstrapLiveState,
  resetStudioBootstrap,
  runStudioBootstrap,
  STUDIO_BOOT_EVENT,
  type StudioBootLiveState,
  type StudioBootPhase,
} from '../studio-os-core/bootstrap';

export type UseStudioBootLiveOptions = {
  through?: StudioBootPhase;
  autoStart?: boolean;
};

export function useStudioBootLive(options: UseStudioBootLiveOptions = {}) {
  const through = options.through ?? 'ui-render';
  const autoStart = options.autoStart ?? true;

  const [live, setLive] = useState<StudioBootLiveState>(() => getInitialStudioBootstrapLiveState());
  const [safeMode, setSafeMode] = useState(false);
  const skipModulesRef = useRef<string[]>([]);
  const bootGenerationRef = useRef(0);

  const syncLive = useCallback(() => {
    const cached = getStudioBootstrapLiveState();
    if (cached) setLive(cached);
  }, []);

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
    const timer = window.setInterval(() => syncLive(), 100);
    return () => clearInterval(timer);
  }, [live.complete, syncLive]);

  const run = useCallback(
    async (opts?: { force?: boolean; safe?: boolean; skipModuleIds?: string[] }) => {
      const gen = ++bootGenerationRef.current;
      if (opts?.force) resetStudioBootstrap();
      if (opts?.safe) setSafeMode(true);
      if (opts?.skipModuleIds) {
        skipModulesRef.current = [...skipModulesRef.current, ...opts.skipModuleIds];
      }

      setLive(getInitialStudioBootstrapLiveState());

      try {
        await runStudioBootstrap({
          through,
          force: opts?.force ?? true,
          safeMode: opts?.safe ?? safeMode,
          skipModuleIds: skipModulesRef.current,
        });
      } catch {
        syncLive();
      }

      if (gen === bootGenerationRef.current) syncLive();
    },
    [through, safeMode, syncLive]
  );

  useEffect(() => {
    if (autoStart) void run({ force: true });
  }, [autoStart, run]);

  const retry = useCallback(() => {
    skipModulesRef.current = [];
    setSafeMode(false);
    void run({ force: true, safe: false });
  }, [run]);

  const continueSafeMode = useCallback(() => {
    void run({ force: true, safe: true });
  }, [run]);

  const skipCurrentModule = useCallback(() => {
    const stuck = live.currentModuleId;
    if (stuck) {
      skipModulesRef.current = [...skipModulesRef.current, stuck];
    } else {
      const loading = live.modules.find((m) => m.status === 'loading');
      if (loading) skipModulesRef.current = [...skipModulesRef.current, loading.id];
    }
    void run({ force: true, safe: safeMode });
  }, [live.currentModuleId, live.modules, run, safeMode]);

  return {
    live,
    safeMode,
    retry,
    continueSafeMode,
    skipCurrentModule,
    run,
  };
}
