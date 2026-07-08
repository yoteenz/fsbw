import type { AtlasFutureAnalysis, AtlasParallelFuture, FutureMergeRecipe } from './types';

/** Synthesize analysis from merged sources — live-updating metrics. */
export function synthesizeMergedAnalysis(
  sources: AtlasParallelFuture[],
  recipe: FutureMergeRecipe
): AtlasFutureAnalysis {
  if (sources.length === 0) {
    return {
      creativeBudgetEstimate: '$0',
      generationCostEstimate: '$0',
      buildDurationWeeks: 0,
      creativeEquity: '+0 CE',
      assetReusePct: 0,
      marketplacePotential: '$0',
      expansionFlexibility: 0,
      aiWorkforceCount: 0,
      navigationEfficiency: 0,
      operationalComplexity: 'low',
      maintainability: 0,
      founderWorkloadHours: 0,
      riskProfile: 'balanced',
      timelineMonths: 0,
      growthProjection: 'N/A',
    };
  }

  const avg = (fn: (a: AtlasFutureAnalysis) => number) =>
    Math.round(sources.reduce((s, f) => s + fn(f.analysis), 0) / sources.length);

  const budgetSource = sources.find((s) =>
    recipe.ingredients.some((i) => i.kind === 'budget-strategy' && i.sourceFutureId === s.id)
  );
  const layoutSource = sources.find((s) =>
    recipe.ingredients.some((i) => i.kind === 'campus-layout' && i.sourceFutureId === s.id)
  );

  const reuseBoost = recipe.ingredients.filter((i) => i.kind === 'building').length * 4;
  const assetReusePct = Math.min(95, avg((a) => a.assetReusePct) + reuseBoost);
  const genCost = budgetSource?.analysis.generationCostEstimate ?? sources[0]!.analysis.generationCostEstimate;
  const nav = layoutSource
    ? Math.round((layoutSource.analysis.navigationEfficiency + avg((a) => a.navigationEfficiency)) / 2)
    : avg((a) => a.navigationEfficiency);

  return {
    creativeBudgetEstimate: `$${Math.round(parseFloat(genCost.replace(/[^0-9.]/g, '')) * 0.85)}K`,
    generationCostEstimate: genCost,
    buildDurationWeeks: Math.round(avg((a) => a.buildDurationWeeks) * 0.9),
    creativeEquity: `+${Math.round(avg((a) => parseInt(a.creativeEquity.replace(/\D/g, ''), 10) || 0) * 1.08)} CE`,
    assetReusePct,
    marketplacePotential: sources.reduce((best, f) => {
      const v = parseFloat(f.analysis.marketplacePotential.replace(/[^0-9.]/g, '')) || 0;
      const b = parseFloat(best.replace(/[^0-9.]/g, '')) || 0;
      return v > b ? f.analysis.marketplacePotential : best;
    }, sources[0]!.analysis.marketplacePotential),
    expansionFlexibility: avg((a) => a.expansionFlexibility),
    aiWorkforceCount: avg((a) => a.aiWorkforceCount),
    navigationEfficiency: nav,
    operationalComplexity:
      sources.some((s) => s.analysis.operationalComplexity === 'high')
        ? 'high'
        : sources.some((s) => s.analysis.operationalComplexity === 'medium')
          ? 'medium'
          : 'low',
    maintainability: avg((a) => a.maintainability),
    founderWorkloadHours: Math.round(avg((a) => a.founderWorkloadHours) * 0.85),
    riskProfile: 'balanced',
    timelineMonths: Math.round(avg((a) => a.timelineMonths) * 0.88),
    growthProjection: `Synthesized · ${avg((a) => a.expansionFlexibility)}% expansion flexibility`,
  };
}

export function buildLiveMergeMetrics(analysis: AtlasFutureAnalysis): import('./types').AtlasLiveMergeMetrics {
  const cost = parseFloat(analysis.generationCostEstimate.replace(/[^0-9.]/g, '')) || 0;
  const savings = (cost * (analysis.assetReusePct / 100) * 0.65).toFixed(2);
  return {
    creativeBudget: analysis.creativeBudgetEstimate,
    buildCost: analysis.generationCostEstimate,
    generationCost: analysis.generationCostEstimate,
    creativeEquity: analysis.creativeEquity,
    marketplacePotential: analysis.marketplacePotential,
    reuseSavings: `$${savings}`,
    constructionTimeline: `${analysis.buildDurationWeeks} weeks · ${analysis.timelineMonths} months`,
    aiWorkforce: analysis.aiWorkforceCount,
    expansionFlexibility: analysis.expansionFlexibility,
    navigationEfficiency: analysis.navigationEfficiency,
  };
}

export function liveMergeMetricLines(metrics: import('./types').AtlasLiveMergeMetrics): string[] {
  return [
    `Creative Budget™ ${metrics.creativeBudget}`,
    `Build ${metrics.buildCost} · Gen ${metrics.generationCost}`,
    `Creative Equity™ ${metrics.creativeEquity}`,
    `Marketplace ${metrics.marketplacePotential} · Reuse savings ${metrics.reuseSavings}`,
    `Timeline ${metrics.constructionTimeline}`,
    `AI ${metrics.aiWorkforce} · Nav ${metrics.navigationEfficiency}% · Exp ${metrics.expansionFlexibility}%`,
  ];
}
