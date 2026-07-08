import type { AtlasFutureCommitSummary, AtlasParallelFuture, ParallelFutureWalkSimulation } from './types';

/** Simulate the Future™ — walk campus before committing. Nothing is built. */
export function simulateParallelFutureWalk(future: AtlasParallelFuture): ParallelFutureWalkSimulation {
  const steps = future.buildings.map((b, i) => ({
    order: i + 1,
    buildingLabel: b.label,
    department: b.department,
    preview: `${b.wingCount} wings · ${b.roomCount} rooms — preview departments and workspaces without generation.`,
    trafficLevel:
      future.analysis.navigationEfficiency > 85
        ? ('low' as const)
        : future.analysis.navigationEfficiency > 75
          ? ('medium' as const)
          : ('high' as const),
    aiMovement:
      future.analysis.aiWorkforceCount > 20
        ? 'High AI concierge traffic between Operations and Marketing wings'
        : future.analysis.aiWorkforceCount > 12
          ? 'Moderate AI patrol routes along central boulevard'
          : 'Light autonomous transit — lean staffing model',
  }));

  return {
    futureId: future.id,
    steps,
    summary: `Simulated ${future.label} — ${steps.length} buildings · nav ${future.analysis.navigationEfficiency}% · AI workforce ${future.analysis.aiWorkforceCount}. Nothing generated.`,
    simulatedAt: new Date().toISOString(),
  };
}

/** Commit summary — shown before explicit approval. No auto-generation. */
export function buildFutureCommitSummary(future: AtlasParallelFuture): AtlasFutureCommitSummary {
  const totalRooms = future.buildings.reduce((s, b) => s + b.roomCount, 0);
  const totalAssets = totalRooms * 8 + future.buildings.length * 12;
  const reusePct = future.analysis.assetReusePct / 100;
  const reusableAssets = Math.round(totalAssets * reusePct);
  const newAssets = totalAssets - reusableAssets;
  const costNum = parseFloat(future.analysis.generationCostEstimate.replace(/[^0-9.]/g, '')) || 100;
  const savings = (costNum * reusePct * 0.63).toFixed(2);

  return {
    totalAssets,
    productionCost: `$${costNum.toFixed(2)}`,
    productionHours: Math.round(totalAssets * 0.008 + future.buildings.length * 0.4),
    reusableAssets,
    newAssetsRequired: newAssets,
    reuseSavings: `$${savings}`,
    approvedAt: new Date().toISOString(),
  };
}

export function commitSummaryLines(summary: AtlasFutureCommitSummary): string[] {
  return [
    `This vision requires approximately ${summary.totalAssets} assets.`,
    `Estimated production cost: ${summary.productionCost}`,
    `Estimated production time: ${(summary.productionHours / 60).toFixed(1)} hours`,
    `Existing reusable assets: ${summary.reusableAssets}`,
    `New assets required: ${summary.newAssetsRequired}`,
    `Estimated savings through reuse: ${summary.reuseSavings}`,
    'Only after explicit approval does Studio OS begin Scene Stack™ generation.',
  ];
}
