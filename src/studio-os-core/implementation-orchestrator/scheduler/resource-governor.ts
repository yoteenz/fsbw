import type { ResourceEstimate, SchedulerBudgetConfig } from '../schemas/os-job';

export function emptyResourceEstimate(): ResourceEstimate {
  return {
    gpuUnits: 0,
    cpuUnits: 0,
    apiCostUsd: 0,
    storageMb: 0,
    expectedTokens: 0,
    expectedRenders: 0,
    expectedRetries: 0,
    queueDepthImpact: 1,
    budgetImpactUsd: 0,
  };
}

export function aggregateResourceEstimates(estimates: ResourceEstimate[]): ResourceEstimate {
  return estimates.reduce(
    (acc, e) => ({
      gpuUnits: acc.gpuUnits + e.gpuUnits,
      cpuUnits: acc.cpuUnits + e.cpuUnits,
      apiCostUsd: acc.apiCostUsd + e.apiCostUsd,
      storageMb: acc.storageMb + e.storageMb,
      expectedTokens: acc.expectedTokens + e.expectedTokens,
      expectedRenders: acc.expectedRenders + e.expectedRenders,
      expectedRetries: acc.expectedRetries + e.expectedRetries,
      queueDepthImpact: acc.queueDepthImpact + e.queueDepthImpact,
      budgetImpactUsd: acc.budgetImpactUsd + e.budgetImpactUsd,
    }),
    emptyResourceEstimate()
  );
}

export type ResourceCapacityCheck = {
  ok: boolean;
  violations: string[];
  requiresApproval: boolean;
};

export function checkResourceCapacity(
  estimate: ResourceEstimate,
  activeEstimates: ResourceEstimate[],
  config: SchedulerBudgetConfig
): ResourceCapacityCheck {
  const active = aggregateResourceEstimates(activeEstimates);
  const violations: string[] = [];

  if (active.gpuUnits + estimate.gpuUnits > config.gpuCapacityUnits) {
    violations.push(`GPU capacity exceeded (${active.gpuUnits + estimate.gpuUnits}/${config.gpuCapacityUnits})`);
  }
  if (active.cpuUnits + estimate.cpuUnits > config.cpuCapacityUnits) {
    violations.push(`CPU capacity exceeded (${active.cpuUnits + estimate.cpuUnits}/${config.cpuCapacityUnits})`);
  }
  if (active.budgetImpactUsd + estimate.budgetImpactUsd > config.dailyBudgetUsd) {
    violations.push(`Daily budget exceeded ($${active.budgetImpactUsd + estimate.budgetImpactUsd}/$${config.dailyBudgetUsd})`);
  }

  const requiresApproval = estimate.budgetImpactUsd >= config.perJobApprovalThresholdUsd;

  return {
    ok: violations.length === 0,
    violations,
    requiresApproval,
  };
}

export function computeUtilizationPct(used: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.round((used / capacity) * 100));
}
