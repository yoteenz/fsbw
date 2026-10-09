/**
 * Phase B paid Codex guard for SITE 00 Astra blockout (Recovery C).
 * Does NOT enforce OpenAI USD caps — only repo-side gates before spawn.
 */

export type PhaseBAuthorizationResult = {
  allowed: boolean;
  reason?: string;
  budgetEnforcement: 'SOFT_ONLY';
  checks: Record<string, boolean>;
};

export function authorizeSite00BlockoutPhaseB(options?: {
  allowPaidGeneration?: boolean;
  founderBudgetUsdEnv?: string;
  phaseBAuthorizedEnv?: string;
}): PhaseBAuthorizationResult {
  const allowPaid = options?.allowPaidGeneration ?? false;
  const budgetRaw = process.env[options?.founderBudgetUsdEnv ?? 'WFE_FOUNDER_AUTHORIZED_BUDGET_USD'];
  const budgetUsd = budgetRaw != null ? Number(budgetRaw) : 0;
  const phaseB = process.env[options?.phaseBAuthorizedEnv ?? 'WFE_BLOCKOUT_PHASE_B_AUTHORIZED'] === '1';

  const checks = {
    allowPaidGenerationFlag: allowPaid,
    founderBudgetUsdSet: Number.isFinite(budgetUsd) && budgetUsd > 0,
    phaseBExplicitAuthorization: phaseB,
  };

  if (!allowPaid) {
    return {
      allowed: false,
      reason: 'Assignment executionBudget.allowPaidGeneration is false',
      budgetEnforcement: 'SOFT_ONLY',
      checks,
    };
  }
  if (!checks.founderBudgetUsdSet) {
    return {
      allowed: false,
      reason: 'Set WFE_FOUNDER_AUTHORIZED_BUDGET_USD to a positive USD ceiling before Phase B',
      budgetEnforcement: 'SOFT_ONLY',
      checks,
    };
  }
  if (!checks.phaseBExplicitAuthorization) {
    return {
      allowed: false,
      reason: 'Set WFE_BLOCKOUT_PHASE_B_AUTHORIZED=1 after founder approves Gate 01 preflight',
      budgetEnforcement: 'SOFT_ONLY',
      checks,
    };
  }

  return { allowed: true, budgetEnforcement: 'SOFT_ONLY', checks };
}
