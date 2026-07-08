import type { AtlasFutureAnalysis, AtlasParallelFuture, AtlasParallelFuturesComparisonRow } from './types';

/** Side-by-side comparison — no guesswork. */
export function buildParallelFuturesComparison(futures: AtlasParallelFuture[]): AtlasParallelFuturesComparisonRow[] {
  return futures.map((f) => ({
    futureId: f.id,
    label: f.label,
    archetype: f.archetype,
    buildCost: f.analysis.generationCostEstimate,
    timelineMonths: f.analysis.timelineMonths,
    creativeEquity: f.analysis.creativeEquity,
    marketplaceValue: f.analysis.marketplacePotential,
    navigationEfficiency: f.analysis.navigationEfficiency,
    expansionFlexibility: f.analysis.expansionFlexibility,
    reusableAssetsPct: f.analysis.assetReusePct,
    aiWorkforce: f.analysis.aiWorkforceCount,
  }));
}

export function formatFutureAnalysisLines(analysis: AtlasFutureAnalysis): string[] {
  return [
    `Creative Budget™ ${analysis.creativeBudgetEstimate}`,
    `Generation ${analysis.generationCostEstimate} · ${analysis.buildDurationWeeks} weeks`,
    `Creative Equity™ ${analysis.creativeEquity}`,
    `Reuse ${analysis.assetReusePct}% · Marketplace ${analysis.marketplacePotential}`,
    `Expansion ${analysis.expansionFlexibility}% · Nav ${analysis.navigationEfficiency}%`,
    `AI Workforce ${analysis.aiWorkforceCount} · Complexity ${analysis.operationalComplexity}`,
    `Maintainability ${analysis.maintainability}% · Founder ${analysis.founderWorkloadHours}h`,
    `Risk ${analysis.riskProfile} · Growth ${analysis.growthProjection}`,
  ];
}
