/**
 * Studio Alpha™ cost aggregation — builds full HUD snapshot from receipts + live context.
 */

import { listGeneratableLayerIdsForStation, getSceneStackStation } from '../scene-stack';
import { SCENE_STACK_LAYER_SHORT_LABELS } from '../scene-stack/layer-catalog';
import type { SceneStackLayerId } from '../scene-stack/types';
import { readCreativeBudgetConfig } from './budget-store';
import {
  costLabel,
  estimateGenerationCost,
  estimateGenerationDurationSec,
} from './cost-engine';
import { buildAssetRoiEntries, buildCreativePortfolioSnapshot } from './portfolio-metrics';
import {
  getActiveGenerationReceipt,
  listGenerationReceipts,
  sumReceiptCosts,
} from './receipt-store';
import type {
  StudioAlphaCostContext,
  StudioAlphaCostSnapshot,
  CostLabel,
} from './types';

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function receiptCost(r: { estimatedCost: number; actualCost?: number; actualCostCertainty: string }): number {
  if (r.actualCostCertainty === 'actual' && typeof r.actualCost === 'number') {
    return r.actualCost;
  }
  return r.estimatedCost;
}

function sumWithLabel(
  receipts: ReturnType<typeof listGenerationReceipts>,
  filter: (r: (typeof receipts)[0]) => boolean,
  certainty: 'estimated' | 'actual' = 'estimated'
): CostLabel {
  const filtered = receipts.filter(filter);
  const hasActual = filtered.some((r) => r.actualCostCertainty === 'actual');
  return costLabel(sumReceiptCosts(filtered), hasActual ? 'actual' : certainty);
}

export function buildStudioAlphaCostSnapshot(
  ctx: StudioAlphaCostContext
): StudioAlphaCostSnapshot {
  const receipts = listGenerationReceipts();
  const budgetConfig = readCreativeBudgetConfig();
  const active = getActiveGenerationReceipt(ctx.departmentId, ctx.projectId);

  const currentGen = active ?? null;
  const genStatus =
    ctx.pipelinePhase === 'generating'
      ? 'generating'
      : ctx.pipelinePhase === 'queued'
        ? 'queued'
        : currentGen?.status ?? 'idle';

  const sceneReceipts = receipts.filter(
    (r) =>
      r.departmentId === ctx.departmentId &&
      r.projectId === ctx.projectId &&
      r.sceneId === ctx.sceneId &&
      (r.status === 'complete' || r.status === 'reused')
  );

  const deptReceipts = receipts.filter(
    (r) =>
      r.departmentId === ctx.departmentId &&
      r.projectId === ctx.projectId &&
      (r.status === 'complete' || r.status === 'reused')
  );

  const station = getSceneStackStation(ctx.departmentId, ctx.sceneId);
  const layerIds = station
    ? listGeneratableLayerIdsForStation(ctx.departmentId, ctx.sceneId, station.layerPrompts)
    : [];

  const pendingLayers = Math.max(0, layerIds.length - ctx.layersComplete);
  const { estimatedCost: perLayerEst } = estimateGenerationCost({});

  const sceneCostSoFar = sumWithLabel(sceneReceipts, () => true);
  const estimatedRemaining = costLabel(pendingLayers * perLayerEst, 'estimated');
  const estimatedFinalScene = costLabel(
    sceneCostSoFar.value + estimatedRemaining.value,
    'estimated'
  );

  const assetsGenerated = sceneReceipts.filter((r) => r.status === 'complete').length;
  const assetsReused = sceneReceipts.filter((r) => r.status === 'reused').length;
  const savingsFromReuseVal = sceneReceipts
    .filter((r) => r.status === 'reused')
    .reduce((s, r) => s + (r.savingsEstimate ?? 0), 0);

  const deptStations = new Set(deptReceipts.map((r) => r.sceneId));
  const allStations = new Set(
    receipts
      .filter((r) => r.departmentId === ctx.departmentId && r.projectId === ctx.projectId)
      .map((r) => r.sceneId)
  );

  const deptCostSoFar = sumWithLabel(deptReceipts, () => true);
  const deptPendingEst = costLabel(
    Math.max(0, (allStations.size || 1) * layerIds.length - deptReceipts.length) * perLayerEst,
    'estimated'
  );
  const deptFinalEst = costLabel(deptCostSoFar.value + deptPendingEst.value, 'estimated');

  const layerCosts = new Map<string, number>();
  for (const r of deptReceipts) {
    const key = r.assetType;
    layerCosts.set(key, (layerCosts.get(key) ?? 0) + receiptCost(r));
  }
  let highestCostLayer: string | null = null;
  let highestCost = 0;
  for (const [layer, cost] of layerCosts) {
    if (cost > highestCost) {
      highestCost = cost;
      highestCostLayer = layer;
    }
  }

  const internalReceipts = receipts.filter(
    (r) => r.status === 'complete' || r.status === 'reused'
  );
  const totalSpend = sumWithLabel(internalReceipts, () => true);
  const monthSpend = sumWithLabel(internalReceipts, (r) => isThisMonth(r.createdAt));
  const todaySpend = sumWithLabel(internalReceipts, (r) => isToday(r.createdAt));

  const totalGenerated = internalReceipts.filter((r) => r.status === 'complete').length;
  const totalReused = internalReceipts.filter((r) => r.status === 'reused').length;
  const totalReuseSavings = internalReceipts
    .filter((r) => r.status === 'reused')
    .reduce((s, r) => s + (r.savingsEstimate ?? 0), 0);

  const sceneCount = new Set(internalReceipts.map((r) => `${r.departmentId}:${r.sceneId}`)).size;
  const deptCount = new Set(internalReceipts.map((r) => r.departmentId)).size;

  const monthSpent = monthSpend.value;
  const pendingGen = receipts.filter(
    (r) =>
      (r.status === 'generating' || r.status === 'queued') &&
      isThisMonth(r.createdAt)
  );
  const pendingEstimate = pendingGen.reduce((s, r) => s + r.estimatedCost, 0);
  const remaining = Math.max(0, budgetConfig.monthlyBudgetUsd - monthSpent - pendingEstimate);

  const dayOfMonth = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const dailyRate = dayOfMonth > 0 ? monthSpent / dayOfMonth : 0;
  const projectedMonthEnd = dailyRate * daysInMonth + pendingEstimate;

  let budgetRisk: 'low' | 'moderate' | 'high' | 'over' = 'low';
  if (projectedMonthEnd > budgetConfig.monthlyBudgetUsd) budgetRisk = 'over';
  else if (projectedMonthEnd > budgetConfig.monthlyBudgetUsd * 0.85) budgetRisk = 'high';
  else if (projectedMonthEnd > budgetConfig.monthlyBudgetUsd * 0.6) budgetRisk = 'moderate';

  const registryReuseSavings = totalReuseSavings;
  const blueprintReuseSavings = Math.round(registryReuseSavings * 0.35 * 100) / 100;
  const efficiencyScore = Math.min(
    100,
    Math.round(
      100 -
        (monthSpent / Math.max(1, budgetConfig.monthlyBudgetUsd)) * 30 +
        (totalReused / Math.max(1, totalGenerated)) * 24
    )
  );

  const assetType =
    ctx.currentLayerLabel ??
    (ctx.currentLayerId
      ? SCENE_STACK_LAYER_SHORT_LABELS[ctx.currentLayerId as SceneStackLayerId]
      : currentGen?.assetType ?? '—');

  return {
    currentGeneration: {
      provider: currentGen?.provider ?? 'FAL',
      model: currentGen?.model ?? 'fal-ai/nano-banana-pro/edit',
      quality: currentGen?.quality ?? '4K / high quality',
      assetType,
      estimatedCost: currentGen
        ? costLabel(currentGen.estimatedCost, 'estimated')
        : costLabel(perLayerEst, 'estimated'),
      actualCost: currentGen?.actualCost
        ? costLabel(
            currentGen.actualCost,
            currentGen.actualCostCertainty === 'actual' ? 'actual' : 'estimated'
          )
        : genStatus === 'complete' && currentGen
          ? costLabel(currentGen.estimatedCost, 'estimated')
          : null,
      estimatedTimeSec: currentGen
        ? estimateGenerationDurationSec(currentGen.model)
        : genStatus === 'generating'
          ? estimateGenerationDurationSec()
          : null,
      status: genStatus,
      generationId: currentGen?.generationId ?? null,
    },
    currentScene: {
      sceneName: ctx.sceneDisplayName,
      layersComplete: ctx.layersComplete,
      layersTotal: ctx.layersTotal || layerIds.length,
      sceneCostSoFar,
      estimatedRemaining,
      estimatedFinalSceneCost: estimatedFinalScene,
      assetsGenerated,
      assetsReused,
      savingsFromReuse: costLabel(savingsFromReuseVal, 'estimated'),
    },
    currentDepartment: {
      departmentName: ctx.departmentDisplayName,
      scenesComplete: deptStations.size,
      scenesTotal: Math.max(allStations.size, deptStations.size, 1),
      departmentCostSoFar: deptCostSoFar,
      estimatedRemaining: deptPendingEst,
      estimatedFinalDepartmentCost: deptFinalEst,
      highestCostLayer,
    },
    studioAlphaTotals: {
      totalInternalSpend: totalSpend,
      thisMonth: monthSpend,
      today: todaySpend,
      totalAssetsGenerated: totalGenerated,
      totalAssetsReused: totalReused,
      estimatedSavingsFromReuse: costLabel(totalReuseSavings, 'estimated'),
      averageCostPerAsset: costLabel(
        totalGenerated > 0 ? totalSpend.value / totalGenerated : 0,
        'estimated'
      ),
      averageCostPerScene: costLabel(
        sceneCount > 0 ? totalSpend.value / sceneCount : 0,
        'estimated'
      ),
      averageCostPerDepartment: costLabel(
        deptCount > 0 ? totalSpend.value / deptCount : 0,
        'estimated'
      ),
    },
    creativeBudget: {
      monthlyBudget: costLabel(budgetConfig.monthlyBudgetUsd, 'actual'),
      spent: costLabel(monthSpent, monthSpend.certainty),
      remaining: costLabel(remaining, 'estimated'),
      pendingEstimate: costLabel(pendingEstimate, 'estimated'),
      projectedMonthEndSpend: costLabel(projectedMonthEnd, 'estimated'),
      budgetRisk,
      savingsFromRegistryReuse: costLabel(registryReuseSavings, 'estimated'),
      savingsFromBlueprintReuse: costLabel(blueprintReuseSavings, 'estimated'),
      efficiencyScore,
    },
    creativePortfolio: buildCreativePortfolioSnapshot(),
    topAssetRoi: buildAssetRoiEntries(3),
    updatedAt: new Date().toISOString(),
  };
}
