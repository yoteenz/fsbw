import { listBuildOrderRegistry } from '../build-order/registry';
import type { BlockedSystemView } from '../types';

/** Blocked systems view */
export function getBuildOrderBlockedView(): BlockedSystemView[] {
  return listBuildOrderRegistry()
    .filter((s) => s.blockedBy.length > 0 || s.currentStatus === 'blocked')
    .map((system) => ({
      systemId: system.systemId,
      officialName: system.officialName,
      blockedBy: system.blockedBy,
      blocks: system.blocks,
      missingDependencies: system.blockedBy,
      topologicalOrder: system.topologicalOrder,
    }))
    .sort((a, b) => a.topologicalOrder - b.topologicalOrder);
}
