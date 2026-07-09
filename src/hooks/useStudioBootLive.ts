import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  getInitialStudioBootstrapLiveState,
  getStudioBootstrapLiveState,
  resetStudioBootstrap,
  startStudioBootstrap,
  isStudioBootstrapInProgress,
  appendStudioBootstrapEvent,
  STUDIO_BOOT_EVENT,
  type StudioBootLiveState,
  type StudioBootPhase,
} from '../studio-os-core/bootstrap';

export type UseStudioBootLiveOptions = {
  through?: StudioBootPhase;
  autoStart?: boolean;
};

/** Prevents StrictMode remount from resetting an in-flight boot. */
let studioBootAutoStartGuard = false;

export function useStudioBootLive(options: UseStudioBootLiveOptions = {}) {
  const through = options.through ?? 'ui-render';
  const autoStart = options.autoStart ?? true;

  const [live, setLive] = useState<StudioBootLiveState>(() => getInitialStudioBootstrapLiveState());
  const [safeMode, setSafeMode] = useState(false);
  const skipModulesRef = useRef<string[]>([]);
  const bootGenerationRef = useRef(0);

  const syncLive = useCallback(() => {
    const cached = getStudioBootstrapLiveState();
    if (cached) {
      setLive(cached);
      return;
    }
    if (!autoStart) {
      setLive((prev) => ({
        ...prev,
        waitingForManualStart: !prev.started,
      }));
    }
  }, [autoStart]);

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
    async (opts?: {
      force?: boolean;
      safe?: boolean;
      skipModuleIds?: string[];
      allowReset?: boolean;
    }) => {
      const gen = ++bootGenerationRef.current;
      const allowReset = opts?.allowReset ?? true;
      const inProgress = isStudioBootstrapInProgress();

      if (opts?.force && allowReset && !inProgress) {
        resetStudioBootstrap();
      } else if (opts?.force && allowReset && inProgress) {
        resetStudioBootstrap();
      }

      if (opts?.safe) setSafeMode(true);
      if (opts?.skipModuleIds) {
        skipModulesRef.current = [...skipModulesRef.current, ...opts.skipModuleIds];
      }

      if (allowReset || !inProgress) {
        setLive({
          ...getInitialStudioBootstrapLiveState(),
          waitingForManualStart: false,
        });
      }

      try {
        await startStudioBootstrap({
          through,
          force: opts?.force ?? true,
          allowReset,
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

  const start = useCallback(() => {
    appendStudioBootstrapEvent('manual bootstrap start');
    void run({ force: true, allowReset: true });
  }, [run]);

  useLayoutEffect(() => {
    appendStudioBootstrapEvent('diagnostics mounted');

    if (!autoStart) {
      setLive((prev) => ({
        ...prev,
        waitingForManualStart: true,
        eventLog: getStudioBootstrapLiveState()?.eventLog ?? prev.eventLog,
      }));
      return;
    }

    if (studioBootAutoStartGuard) {
      syncLive();
      return;
    }
    studioBootAutoStartGuard = true;

    void run({
      force: true,
      allowReset: !isStudioBootstrapInProgress(),
    });
  }, [autoStart, run, syncLive]);

  const retry = useCallback(() => {
    skipModulesRef.current = [];
    setSafeMode(false);
    appendStudioBootstrapEvent('bootstrap retry requested');
    void run({ force: true, allowReset: true, safe: false });
  }, [run]);

  const continueSafeMode = useCallback(() => {
    void run({ force: true, allowReset: true, safe: true });
  }, [run]);

  const skipCurrentModule = useCallback(() => {
    const stuck = live.currentModuleId;
    if (stuck) {
      skipModulesRef.current = [...skipModulesRef.current, stuck];
    } else {
      const loading = live.modules.find((m) => m.status === 'loading');
      if (loading) skipModulesRef.current = [...skipModulesRef.current, loading.id];
    }
    void run({ force: true, allowReset: true, safe: safeMode });
  }, [live.currentModuleId, live.modules, run, safeMode]);

  return {
    live,
    safeMode,
    autoStart,
    start,
    retry,
    continueSafeMode,
    skipCurrentModule,
    run,
  };
}
