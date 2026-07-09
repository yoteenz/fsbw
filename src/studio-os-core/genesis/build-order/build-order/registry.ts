import { mutateBuildOrderStore, readBuildOrderStore } from '../persistence';
import { recomputeBuildOrder } from '../bootstrap/seed';
import type { BuildOrderSystemRecord, BuildOrderValidationReport } from '../types';

/** Build Order Registry™ */
export function listBuildOrderRegistry(): BuildOrderSystemRecord[] {
  return [...readBuildOrderStore().systems].sort(
    (a, b) => a.topologicalOrder - b.topologicalOrder
  );
}

export function getBuildOrderSystem(systemId: string): BuildOrderSystemRecord | undefined {
  return readBuildOrderStore().systems.find((s) => s.systemId === systemId);
}

export function searchBuildOrderRegistry(query: string): BuildOrderSystemRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return listBuildOrderRegistry();
  return listBuildOrderRegistry().filter(
    (s) =>
      s.systemId.includes(q) ||
      s.officialName.toLowerCase().includes(q) ||
      s.purpose.toLowerCase().includes(q)
  );
}

export function listBuildOrderByPhase(phase: number): BuildOrderSystemRecord[] {
  return listBuildOrderRegistry().filter((s) => s.architecturalPhase === phase);
}

export function listBuildOrderByStatus(status: string): BuildOrderSystemRecord[] {
  return listBuildOrderRegistry().filter((s) => s.currentStatus === status);
}

export function updateBuildOrderSystemStatus(
  systemId: string,
  currentStatus: BuildOrderSystemRecord['currentStatus']
): BuildOrderSystemRecord | undefined {
  let updated: BuildOrderSystemRecord | undefined;
  mutateBuildOrderStore((store) => {
    const systems = store.systems.map((s) => {
      if (s.systemId !== systemId) return s;
      updated = {
        ...s,
        currentStatus,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });
    return { ...store, systems };
  });

  if (updated) recomputeBuildOrder();
  return updated;
}

export function validateBuildOrderStore(): BuildOrderValidationReport {
  const systems = listBuildOrderRegistry();
  const issues: BuildOrderValidationReport['issues'] = [];
  const ids = new Set(systems.map((s) => s.systemId));

  for (const system of systems) {
    for (const dep of system.dependencies) {
      if (!ids.has(dep)) {
        issues.push({
          code: 'UNKNOWN_DEPENDENCY',
          message: `Unknown dependency "${dep}"`,
          systemId: system.systemId,
        });
      }
    }
    if (!system.officialName.trim()) {
      issues.push({
        code: 'MISSING_NAME',
        message: 'Official name is required',
        systemId: system.systemId,
      });
    }
  }

  const orders = systems.map((s) => s.topologicalOrder);
  const uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    issues.push({
      code: 'DUPLICATE_TOPOLOGICAL_ORDER',
      message: 'Duplicate topological order values detected',
    });
  }

  return { valid: issues.length === 0, issues };
}
