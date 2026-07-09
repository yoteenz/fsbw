import { CRITICAL_PATH_SYSTEM_IDS } from '../constants';
import { listBuildOrderRegistry } from '../build-order/registry';
import type { CriticalPathEntry, CriticalPathView } from '../types';

/** Critical Path Analyzer™ */
export function getCriticalPathView(): CriticalPathView {
  const registry = listBuildOrderRegistry();
  const byId = new Map(registry.map((s) => [s.systemId, s]));

  let nextSystemId: string | null = null;
  const path: CriticalPathEntry[] = CRITICAL_PATH_SYSTEM_IDS.map((systemId, index) => {
    const system = byId.get(systemId);
    const isComplete = system?.currentStatus === 'implemented';
    if (!nextSystemId && system && !isComplete && system.currentStatus !== 'deferred') {
      nextSystemId = systemId;
    }
    return {
      systemId,
      officialName: system?.officialName ?? systemId,
      position: index + 1,
      currentStatus: system?.currentStatus ?? 'planned',
      isComplete,
      isNext: systemId === nextSystemId,
    };
  });

  const completedCount = path.filter((p) => p.isComplete).length;

  return {
    path,
    completedCount,
    nextSystemId,
    totalLength: path.length,
  };
}

export function getCriticalPathProgress(): number {
  const view = getCriticalPathView();
  if (view.totalLength === 0) return 0;
  return Math.round((view.completedCount / view.totalLength) * 100);
}
