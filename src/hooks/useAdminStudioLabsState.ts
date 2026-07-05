import {useCallback, useMemo, useState} from 'react';
import { scopeStorageKey, getRuntimeActiveWorkspaceId } from '../studio-os-core/workspace/storage';
import {
  bootstrapLabsStore,
  compareExperiments,
  readLabsStore,
  syncLabsIntelligence,
  writeLabsStore,
  type Experiment,
} from '../studio-os-core/labs';
import { buildDemoLabsStorePatch } from '../utils/adminStudioLabsDemo';

const LABS_ACTIVE_WS_KEY = 'adminStudioLabsActiveWs_v1';

function readActiveWorkspaceOverride(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(scopeStorageKey(LABS_ACTIVE_WS_KEY, getRuntimeActiveWorkspaceId()));
}

function ensureDemoSeeded(): void {
  bootstrapLabsStore();
  const store = readLabsStore();
  if (store.experiments.length === 0) {
    writeLabsStore({ ...store, ...buildDemoLabsStorePatch() });
  }
  const ws = readActiveWorkspaceOverride() ?? getRuntimeActiveWorkspaceId() ?? 'ai-media';
  syncLabsIntelligence(ws);
}

export function useAdminStudioLabsState(workspaceIdOverride?: string) {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => {
    ensureDemoSeeded();
    setVersion((v) => v + 1);
  }, []);

  const workspaceId = workspaceIdOverride ?? readActiveWorkspaceOverride() ?? getRuntimeActiveWorkspaceId() ?? 'ai-media';

  const store = useMemo(() => {
    void version;
    return readLabsStore();
  }, [version]);

  const experiments = store.experiments.filter((e) => e.workspaceId === workspaceId);
  const activeExperiments = experiments.filter((e) => e.status === 'active' || e.status === 'collecting');
  const completedExperiments = experiments.filter((e) => e.status === 'completed' || e.status === 'promoted');
  const learnings = store.learnings.filter((l) => l.workspaceId === workspaceId);
  const hooks = store.hooks.filter((h) => h.workspaceId === workspaceId);
  const captions = store.captions.filter((c) => c.workspaceId === workspaceId);
  const series = store.series.filter((s) => s.workspaceId === workspaceId);
  const pillars = store.pillars.filter((p) => p.workspaceId === workspaceId);
  const benchmarks = store.benchmarks.filter((b) => b.workspaceId === workspaceId);
  const promotions = store.promotions.filter((p) => p.workspaceId === workspaceId);
  const recommendations = store.recommendations.filter((r) => r.workspaceId === workspaceId);
  const institutionalMemory = store.institutionalMemory;

  const topHooks = useMemo(() => [...hooks].sort((a, b) => b.successScore - a.successScore).slice(0, 5), [hooks]);
  const topRevenue = useMemo(
    () => [...experiments].sort((a, b) => b.metrics.revenue - a.metrics.revenue).slice(0, 3),
    [experiments]
  );
  const topRetention = useMemo(
    () => [...experiments].sort((a, b) => b.metrics.completionRate - a.metrics.completionRate).slice(0, 3),
    [experiments]
  );

  const compare = useCallback(
    (aId: string, bId: string) => {
      const a = experiments.find((e) => e.id === aId);
      const b = experiments.find((e) => e.id === bId);
      if (!a || !b) return null;
      return compareExperiments(a, b);
    },
    [experiments]
  );

  return {
    workspaceId,
    store,
    experiments,
    activeExperiments,
    completedExperiments,
    learnings,
    hooks,
    captions,
    series,
    pillars,
    benchmarks,
    promotions,
    recommendations,
    institutionalMemory,
    topHooks,
    topRevenue,
    topRetention,
    compare,
    refresh,
  };
}

export type { Experiment };
