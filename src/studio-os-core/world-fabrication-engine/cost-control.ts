import type { ProductionBudget, BudgetDecisionOutcome } from '../production-governance/types';

export type FabricationCostProvider = 'ARTLIST' | 'INTERNAL' | 'CLOUD_GPU' | 'MANUAL';

/** Extended technical-art spend categories (ledger labels; no pricing invented). */
export type FabricationTechnicalArtCostCategory =
  | 'AI_MASSING'
  | 'GEOMETRY_RECONSTRUCTION'
  | 'TEXTURE_GENERATION'
  | 'MATERIAL_DEVELOPMENT'
  | 'TEXTURE_BAKING'
  | 'RENDERING'
  | 'ENGINE_VALIDATION'
  | 'OPTIMIZATION'
  | 'RIGGING'
  | 'ANIMATION'
  | 'REVISION'
  | 'EXTERNAL_COMPUTE';

export type FabricationCostLine = {
  lineId: string;
  manifestId: string;
  stageId: string;
  provider: FabricationCostProvider;
  model?: string;
  quotedCredits?: number;
  actualCredits?: number;
  generationAttempts: number;
  reconstructionRuns: number;
  renderPasses: number;
  exportAttempts: number;
  computeDurationMs?: number;
  manualIntervention: boolean;
  recordedAt: string;
  technicalArtCategory?: FabricationTechnicalArtCostCategory;
};

export type FabricationJobBudget = {
  budgetId: string;
  manifestId: string;
  organizationId: string;
  preflightEstimateCredits?: number;
  jobBudgetCapCredits?: number;
  perStageCaps: Record<string, number>;
  spentCredits: number;
  allowPaidGeneration: boolean;
  autoRetryPaid: false;
  requiresFounderApprovalAboveCap: true;
};

export function evaluateFabricationSpend(
  budget: FabricationJobBudget,
  nextSpendCredits: number
): { outcome: BudgetDecisionOutcome; allowed: boolean; reason?: string } {
  if (!budget.allowPaidGeneration) {
    return { outcome: 'BLOCKED_BUDGET', allowed: false, reason: 'Paid generation not authorized for this job' };
  }
  const projected = budget.spentCredits + nextSpendCredits;
  if (budget.jobBudgetCapCredits != null && projected > budget.jobBudgetCapCredits) {
    return {
      outcome: 'BLOCKED_BUDGET',
      allowed: false,
      reason: 'Would exceed job budget cap — founder approval required',
    };
  }
  return { outcome: 'ALLOWED', allowed: true };
}

/** Bridge hook — production governance budgets may supersede in server routes. */
export function mapProductionBudgetToFabricationCap(budget: ProductionBudget): number | undefined {
  return budget.hardLimit ?? budget.softLimit;
}
