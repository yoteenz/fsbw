import type { StudioOsJob, SchedulerBudgetConfig } from '../schemas/os-job';
import { checkResourceCapacity } from './resource-governor';

export type CostGovernorResult =
  | { ok: true; canDispatch: true }
  | { ok: false; code: 'BUDGET_EXCEEDED' | 'APPROVAL_REQUIRED' | 'RESOURCE_LIMIT'; message: string };

export function evaluateCostGovernor(
  job: StudioOsJob,
  activeJobs: StudioOsJob[],
  config: SchedulerBudgetConfig
): CostGovernorResult {
  const activeEstimates = activeJobs
    .filter((j) => j.status === 'RUNNING' || j.status === 'QUEUED')
    .map((j) => j.resourceEstimate);

  const capacity = checkResourceCapacity(job.resourceEstimate, activeEstimates, config);

  if (!capacity.ok) {
    return {
      ok: false,
      code: 'RESOURCE_LIMIT',
      message: capacity.violations.join('; '),
    };
  }

  const budgetApproval = job.approvalRequirements.find((a) => a.type === 'budget');
  if (capacity.requiresApproval && budgetApproval?.required && !budgetApproval.satisfied) {
    return {
      ok: false,
      code: 'APPROVAL_REQUIRED',
      message: `Job ${job.title} exceeds $${config.perJobApprovalThresholdUsd} threshold — founder budget approval required.`,
    };
  }

  const totalBudget = activeEstimates.reduce((s, e) => s + e.budgetImpactUsd, 0) + job.resourceEstimate.budgetImpactUsd;
  if (totalBudget > config.dailyBudgetUsd) {
    const founderBudget = job.approvalRequirements.find((a) => a.type === 'budget');
    if (founderBudget?.required && !founderBudget.satisfied) {
      return {
        ok: false,
        code: 'BUDGET_EXCEEDED',
        message: `Daily budget would exceed $${config.dailyBudgetUsd} without approval.`,
      };
    }
  }

  return { ok: true, canDispatch: true };
}

export function approveJobBudget(job: StudioOsJob): StudioOsJob {
  return {
    ...job,
    approvalRequirements: job.approvalRequirements.map((a) =>
      a.type === 'budget' ? { ...a, satisfied: true } : a
    ),
    updatedDate: new Date().toISOString(),
    auditHistory: [
      ...job.auditHistory,
      { event: 'approved', at: new Date().toISOString(), reason: 'budget-approved', actor: 'founder' },
    ],
  };
}
