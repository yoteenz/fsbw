import type { PermitApplication } from './permit-engine';
import type { ConstructionBudgetForecast } from './construction-budget-engine';
import type { MunicipalValidationResult } from './contract';
import { appendLedgerEntry, createMunicipalLedgerEntry, type MunicipalLedger } from './municipal-ledger';

export const CITY_COUNCIL_VERSION = 'city-council.v1' as const;

export type CityCouncilReviewInput = {
  permit: PermitApplication;
  budget: ConstructionBudgetForecast;
  immunePassed: boolean;
  qualityGuardPassed: boolean;
  securityPassed: boolean;
  compatibilityPassed: boolean;
  performancePassed: boolean;
  maxBudgetUsd?: number;
};

export type CityCouncilDecision = {
  councilVersion: typeof CITY_COUNCIL_VERSION;
  approved: boolean;
  code: string;
  message: string;
  reviewedAt: string;
  conditions: string[];
};

export function reviewCityCouncilPermit(input: CityCouncilReviewInput): CityCouncilDecision {
  const conditions: string[] = [];
  const maxBudget = input.maxBudgetUsd ?? 50;

  if (!input.immunePassed) {
    return deny('IMMUNE_REVIEW_REQUIRED', 'City Council cannot approve — Immune System review failed.');
  }
  if (!input.qualityGuardPassed) {
    return deny('QUALITY_GUARD_REQUIRED', 'City Council cannot approve — Quality Guard review failed.');
  }
  if (!input.securityPassed) {
    return deny('SECURITY_REVIEW_REQUIRED', 'City Council cannot approve — security review failed.');
  }
  if (!input.compatibilityPassed) {
    return deny('COMPATIBILITY_REVIEW_REQUIRED', 'City Council cannot approve — compatibility review failed.');
  }
  if (!input.performancePassed) {
    conditions.push('Performance review passed with monitoring conditions.');
  }
  if (input.budget.totalProjectedCostUsd > maxBudget) {
    return deny('BUDGET_EXCEEDS_LIMIT', `Projected cost $${input.budget.totalProjectedCostUsd} exceeds council limit $${maxBudget}.`);
  }

  return {
    councilVersion: CITY_COUNCIL_VERSION,
    approved: true,
    code: 'COUNCIL_APPROVED',
    message: `Permit ${input.permit.permitId} approved by City Council™.`,
    reviewedAt: new Date().toISOString(),
    conditions,
  };
}

function deny(code: string, message: string): CityCouncilDecision {
  return {
    councilVersion: CITY_COUNCIL_VERSION,
    approved: false,
    code,
    message,
    reviewedAt: new Date().toISOString(),
    conditions: [],
  };
}

export function recordCouncilDecision(
  ledger: MunicipalLedger,
  decision: CityCouncilDecision,
  permit: PermitApplication,
  actorId: string
): MunicipalLedger {
  const entry = createMunicipalLedgerEntry({
    entryId: `council-${permit.permitId}-${Date.now()}`,
    organizationId: permit.organizationId,
    sceneId: permit.sceneId,
    departmentId: permit.departmentId,
    permitId: permit.permitId,
    decisionKind: decision.approved ? 'permit-approval' : 'permit-denial',
    actorId,
    summary: decision.message,
    metadata: { code: decision.code, conditions: decision.conditions },
  });
  return appendLedgerEntry(ledger, entry);
}

export function validateCouncilApproval(decision: CityCouncilDecision): MunicipalValidationResult {
  if (!decision.approved) {
    return { ok: false, code: decision.code, message: decision.message };
  }
  return { ok: true };
}
