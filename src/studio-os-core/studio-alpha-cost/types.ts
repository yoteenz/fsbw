/** Studio Alpha™ internal production cost — types for receipts, budget, and HUD snapshots. */

export type CostCertainty = 'estimated' | 'actual' | 'unknown';

export type GenerationReceiptStatus =
  | 'queued'
  | 'generating'
  | 'complete'
  | 'failed'
  | 'reused';

export type FalPricingEntry = {
  provider: 'FAL';
  model: string;
  quality: string;
  resolution: string;
  costPerImage: number;
  costPerSecond?: number;
  upscaleCost?: number;
  estimatedStorageCost?: number;
  lastUpdated: string;
  notes?: string;
};

export type GenerationReceipt = {
  generationId: string;
  assetId: string;
  sceneId: string;
  departmentId: string;
  projectId: string;
  provider: string;
  model: string;
  quality: string;
  resolution: string;
  assetType: string;
  estimatedCost: number;
  actualCost?: number;
  actualCostCertainty: CostCertainty;
  durationMs?: number;
  status: GenerationReceiptStatus;
  createdAt: string;
  approvedAt?: string;
  reusedAssets?: string[];
  savingsEstimate?: number;
  error?: string;
};

export type CreativeBudgetConfig = {
  monthlyBudgetUsd: number;
  updatedAt: string;
};

export type CostLabel = {
  value: number;
  certainty: CostCertainty;
  display: string;
};

export type CurrentGenerationSnapshot = {
  provider: string;
  model: string;
  quality: string;
  assetType: string;
  estimatedCost: CostLabel;
  actualCost: CostLabel | null;
  estimatedTimeSec: number | null;
  status: GenerationReceiptStatus | 'idle';
  generationId: string | null;
};

export type CurrentSceneSnapshot = {
  sceneName: string;
  layersComplete: number;
  layersTotal: number;
  sceneCostSoFar: CostLabel;
  estimatedRemaining: CostLabel;
  estimatedFinalSceneCost: CostLabel;
  assetsGenerated: number;
  assetsReused: number;
  savingsFromReuse: CostLabel;
};

export type CurrentDepartmentSnapshot = {
  departmentName: string;
  scenesComplete: number;
  scenesTotal: number;
  departmentCostSoFar: CostLabel;
  estimatedRemaining: CostLabel;
  estimatedFinalDepartmentCost: CostLabel;
  highestCostLayer: string | null;
};

export type StudioAlphaTotalsSnapshot = {
  totalInternalSpend: CostLabel;
  thisMonth: CostLabel;
  today: CostLabel;
  totalAssetsGenerated: number;
  totalAssetsReused: number;
  estimatedSavingsFromReuse: CostLabel;
  averageCostPerAsset: CostLabel;
  averageCostPerScene: CostLabel;
  averageCostPerDepartment: CostLabel;
};

export type CreativeBudgetSnapshot = {
  monthlyBudget: CostLabel;
  spent: CostLabel;
  remaining: CostLabel;
  pendingEstimate: CostLabel;
  projectedMonthEndSpend: CostLabel;
  budgetRisk: 'low' | 'moderate' | 'high' | 'over';
  savingsFromRegistryReuse: CostLabel;
  savingsFromBlueprintReuse: CostLabel;
  efficiencyScore: number;
};

export type CreativePortfolioSnapshot = {
  creativeEquityScore: number;
  estimatedPortfolioValue: CostLabel;
  reusableAssets: number;
  blueprintSystems: number;
  highestRoiAsset: string | null;
  mostReusedBlueprint: string | null;
  assetHealth: number;
  designConsistency: number;
  marketplaceEligibleAssets: number;
  studioCertifiedCandidates: number;
};

export type AssetRoiEntry = {
  assetId: string;
  displayName: string;
  generationCost: CostLabel;
  reuseCount: number;
  scenesUsing: number;
  departmentsUsing: number;
  effectiveCostPerUse: CostLabel;
  savingsGenerated: CostLabel;
  marketplaceEligible: boolean;
  portfolioValue: CostLabel;
};

export type StudioAlphaCostSnapshot = {
  currentGeneration: CurrentGenerationSnapshot;
  currentScene: CurrentSceneSnapshot;
  currentDepartment: CurrentDepartmentSnapshot;
  studioAlphaTotals: StudioAlphaTotalsSnapshot;
  creativeBudget: CreativeBudgetSnapshot;
  creativePortfolio: CreativePortfolioSnapshot;
  topAssetRoi: AssetRoiEntry[];
  updatedAt: string;
};

export type StudioAlphaCostContext = {
  departmentId: string;
  projectId: string;
  sceneId: string;
  departmentDisplayName: string;
  sceneDisplayName: string;
  layersComplete: number;
  layersTotal: number;
  pipelinePhase: 'idle' | 'queued' | 'generating';
  currentLayerId?: string | null;
  currentLayerLabel?: string | null;
};
