import type { PermitType } from './contract';

export const CONSTRUCTION_BUDGET_VERSION = 'construction-budget-engine.v1' as const;

export type ConstructionBudgetForecast = {
  engineVersion: typeof CONSTRUCTION_BUDGET_VERSION;
  estimatedAiCostUsd: number;
  estimatedGpuMinutes: number;
  estimatedStorageMb: number;
  expectedBuildDurationMinutes: number;
  expectedAssetCount: number;
  expectedRenderCount: number;
  expectedQueueLoad: number;
  expectedRetryCostUsd: number;
  totalProjectedCostUsd: number;
  currency: 'USD';
};

export type ConstructionBudgetInput = {
  permitType: PermitType;
  assetCount: number;
  renderCount: number;
  isolationAttempts?: number;
  includesWorldGeneration?: boolean;
  includesBackgroundCleanup?: boolean;
  priorityReview?: boolean;
};

const BASE_COST_BY_PERMIT: Record<PermitType, number> = {
  building: 2.5,
  'department-expansion': 1.8,
  infrastructure: 1.2,
  renovation: 1.0,
  'interior-design': 0.35,
  'marketplace-certification': 0.5,
  automation: 0.25,
  utility: 0.15,
  'ai-service': 0.4,
  'large-world-expansion': 4.0,
};

const PER_ASSET_COST = 0.12;
const PER_RENDER_COST = 0.08;
const PER_RETRY_COST = 0.05;
const WORLD_GENERATION_SURCHARGE = 1.5;

export function forecastConstructionBudget(input: ConstructionBudgetInput): ConstructionBudgetForecast {
  const base = BASE_COST_BY_PERMIT[input.permitType] ?? 1.0;
  const assetCost = input.assetCount * PER_ASSET_COST;
  const renderCost = input.renderCount * PER_RENDER_COST;
  const retryCost = (input.isolationAttempts ?? 0) * PER_RETRY_COST;
  const worldSurcharge = input.includesWorldGeneration ? WORLD_GENERATION_SURCHARGE : 0;
  const prioritySurcharge = input.priorityReview ? base * 0.25 : 0;

  const estimatedAiCostUsd = base + assetCost + renderCost + retryCost + worldSurcharge + prioritySurcharge;
  const expectedAssetCount = input.assetCount;
  const expectedRenderCount = input.renderCount + (input.includesWorldGeneration ? 1 : 0);
  const expectedQueueLoad = Math.ceil(expectedRenderCount / 4);
  const estimatedGpuMinutes = expectedRenderCount * 3 + (input.includesWorldGeneration ? 8 : 0);
  const estimatedStorageMb = expectedAssetCount * 12 + expectedRenderCount * 8;
  const expectedBuildDurationMinutes = estimatedGpuMinutes + expectedAssetCount * 2;
  const expectedRetryCostUsd = retryCost;

  return {
    engineVersion: CONSTRUCTION_BUDGET_VERSION,
    estimatedAiCostUsd: round2(estimatedAiCostUsd),
    estimatedGpuMinutes,
    estimatedStorageMb,
    expectedBuildDurationMinutes,
    expectedAssetCount,
    expectedRenderCount,
    expectedQueueLoad,
    expectedRetryCostUsd: round2(expectedRetryCostUsd),
    totalProjectedCostUsd: round2(estimatedAiCostUsd + expectedRetryCostUsd),
    currency: 'USD',
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
