import { useCallback, useEffect, useState } from 'react';
import { buildRenderQueueSeed } from '../studio-os-core/render-queue/bootstrap';
import {
  bootstrapRenderQueueStore,
  cancelRenderJob,
  duplicateRenderJob,
  pauseRenderJob,
  readRenderQueueStore,
  resumeRenderJob,
  selectRenderJob,
  setRenderPriority,
  setRenderQueueBatchMode,
  startBatchRender,
  tickRenderQueueSimulation,
  toggleRenderBatchSelection,
} from '../studio-os-core/render-queue/store';

function ensureBootstrap(): void {
  bootstrapRenderQueueStore(buildRenderQueueSeed());
}

export function useRenderQueueState() {
  const [, setTick] = useState(0);
  useState(() => {
    ensureBootstrap();
    return 0;
  });

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    ensureBootstrap();
    const id = window.setInterval(() => {
      tickRenderQueueSimulation();
      setTick((t) => t + 1);
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  const store = readRenderQueueStore();

  const selectedRender =
    store.renders.find((r) => r.id === store.selectedRenderId) ?? store.renders[0] ?? null;

  const activeRenders = store.renders.filter((r) => r.controlState !== 'cancelled');

  const selectRender = useCallback(
    (id: string | null) => {
      selectRenderJob(id);
      refresh();
    },
    [refresh]
  );

  const pause = useCallback(
    (id: string) => {
      pauseRenderJob(id);
      refresh();
    },
    [refresh]
  );

  const resume = useCallback(
    (id: string) => {
      resumeRenderJob(id);
      refresh();
    },
    [refresh]
  );

  const cancel = useCallback(
    (id: string) => {
      cancelRenderJob(id);
      refresh();
    },
    [refresh]
  );

  const duplicate = useCallback(
    (id: string) => {
      duplicateRenderJob(id);
      refresh();
    },
    [refresh]
  );

  const setPriority = useCallback(
    (id: string, high: boolean) => {
      setRenderPriority(id, high ? 'high' : 'normal');
      refresh();
    },
    [refresh]
  );

  const toggleBatchMode = useCallback(
    (enabled: boolean) => {
      setRenderQueueBatchMode(enabled);
      refresh();
    },
    [refresh]
  );

  const toggleBatchSelect = useCallback(
    (id: string) => {
      toggleRenderBatchSelection(id);
      refresh();
    },
    [refresh]
  );

  const runBatch = useCallback(() => {
    const ids = store.selectedBatchIds.length > 0 ? store.selectedBatchIds : activeRenders.filter((r) => r.stage === 'queued').map((r) => r.id);
    if (ids.length > 0) {
      startBatchRender(ids);
      refresh();
    }
  }, [store.selectedBatchIds, activeRenders, refresh]);

  return {
    store,
    selectedRender,
    activeRenders,
    selectRender,
    pause,
    resume,
    cancel,
    duplicate,
    setPriority,
    toggleBatchMode,
    toggleBatchSelect,
    runBatch,
    refresh,
  };
}
