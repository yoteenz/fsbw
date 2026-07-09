import { listBuildOrderRegistry } from '../build-order/registry';
import { getBuildOrderReadyView } from '../readiness/implementation';
import { BUILD_ORDER_SPRINT_CYCLES } from '../seeds/studio-os-systems';
import type { CurrentSprintView } from '../types';

/** Current sprint view from 12-cycle sequence */
export function getCurrentSprintView(): CurrentSprintView {
  const registry = listBuildOrderRegistry();
  const byId = new Map(registry.map((s) => [s.systemId, s]));
  const readyIds = new Set(getBuildOrderReadyView().map((s) => s.systemId));

  for (const cycle of BUILD_ORDER_SPRINT_CYCLES) {
    const primary = byId.get(cycle.primarySystemId);
    const isImplemented = primary?.currentStatus === 'implemented';
    if (!isImplemented) {
      return {
        cycle: cycle.cycle,
        primaryBuild: cycle.primaryBuild,
        secondaryParallel: [...cycle.secondaryParallel],
        exitCondition: cycle.exitCondition,
        primarySystemId: cycle.primarySystemId,
        isPrimaryReady: readyIds.has(cycle.primarySystemId),
      };
    }
  }

  const last = BUILD_ORDER_SPRINT_CYCLES[BUILD_ORDER_SPRINT_CYCLES.length - 1];
  return {
    cycle: last.cycle,
    primaryBuild: last.primaryBuild,
    secondaryParallel: [...last.secondaryParallel],
    exitCondition: last.exitCondition,
    primarySystemId: last.primarySystemId,
    isPrimaryReady: true,
  };
}
