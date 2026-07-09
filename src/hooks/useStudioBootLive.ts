import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  getInitialStudioBootstrapLiveState,
  getStudioBootstrapLiveState,
  resetStudioBootstrap,
  isStudioBootstrapInProgress,
  appendStudioBootstrapEvent,
  startStudioBootstrap,
  type StudioBootLiveState,
  type StudioBootPhase,
} from '../studio-os-core/bootstrap';
import {
  clearStudioBootstrapOrchestrator,
  ensureStudioBootstrapStarted,
  subscribeStudioBoot,
} from '../studio-os-core/bootstrap/studio-bootstrap-init';

export type UseStudioBootLiveOptions = {
  through?: StudioBootPhase;
  autoStart?: boolean;
};

export function useStudioBootLive(options: UseStudioBootLiveOptions = {}) {
  const through = options.through ?? 'ui-render';
  const autoStart = options.autoStart ?? true;

  const [live, setLive] = useState<StudioBootLiveState>(() => {
    const cached = getStudioBootstrapLiveState();
    return cached ?? getInitialStudioBootstrapLiveState();
  });
  const [safeMode, setSafeMode] = useState(false);
  const skipModulesRef = useRef<string[]>([]);
  const bootGenerationRef = useRef(0);

  useLayoutEffect(() => {
    const unsub = subscribeStudioBoot(setLive);

    if (autoStart) {
      appendStudioBootstrapEvent('diagnostics mounted');
      void ensureStudioBootstrapStarted({ through });
    } else {
      setLive((prev) => ({
        ...prev,
        waitingForManualStart: !prev.started && !prev.complete,
        eventLog: getStudioBootstrapLiveState()?.eventLog ?? prev.eventLog,
      }));
    }

    return unsub;
  }, [autoStart, through]);

  const syncLive = useCallback(() => {
    const cached = getStudioBootstrapLiveState();
    if (cached) setLive(cached);
  }, []);

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

      if (opts?.force && allowReset) {
        clearStudioBootstrapOrchestrator();
        if (!inProgress || allowReset) resetStudioBootstrap();
      }

      if (opts?.safe) setSafeMode(true);
      if (opts?.skipModuleIds) {
        skipModulesRef.current = [...skipModulesRef.current, ...opts.skipModuleIds];
      }

      if (allowReset || !inProgress) {
        setLive((prev) => ({
          ...(getStudioBootstrapLiveState() ?? getInitialStudioBootstrapLiveState()),
          waitingForManualStart: false,
          eventLog: prev.eventLog.length ? prev.eventLog : (getStudioBootstrapLiveState()?.eventLog ?? []),
        }));
      }

      try {
        await startStudioBootstrap({
          through,
          force: opts?.force ?? false,
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
      const active = live.modules.find((m) => m.status === 'starting' || m.status === 'running');
      if (active) skipModulesRef.current = [...skipModulesRef.current, active.id];
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
