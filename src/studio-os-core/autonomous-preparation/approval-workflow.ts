import { APPROVAL_ACTION_LABELS } from './constants';
import type { ApprovalAction, PendingPreparation, PreparationStatus } from './types';

export function statusForAction(action: ApprovalAction): PreparationStatus {
  if (action === 'approve') return 'approved';
  if (action === 'edit') return 'edited';
  if (action === 'reject') return 'rejected';
  if (action === 'schedule') return 'scheduled';
  if (action === 'delegate') return 'delegated';
  return 'archived';
}

export function describeApprovalWorkflow(prep: PendingPreparation): string {
  return [
    `Why prepared: ${prep.whyPrepared}`,
    `Trigger: ${prep.trigger}`,
    `Expected benefit: ${prep.expectedBenefit}`,
    `Confidence: ${prep.confidencePct}%`,
    `Available: ${prep.availableActions.map((a) => APPROVAL_ACTION_LABELS[a]).join(' · ')}`,
    'Status: inactive until approved — nothing executes automatically.',
  ].join('\n');
}

export function applyActionToPreparation(
  prep: PendingPreparation,
  action: ApprovalAction
): PendingPreparation {
  return {
    ...prep,
    status: statusForAction(action),
  };
}

export function countAwaitingApproval(preparations: PendingPreparation[]): number {
  return preparations.filter((p) => p.status === 'pending').length;
}

export function listWorkflowActions(): ApprovalAction[] {
  return ['approve', 'edit', 'reject', 'schedule', 'delegate', 'archive'];
}
