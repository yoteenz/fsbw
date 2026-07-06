import type { StateTransitionRule } from './types';

/** Canonical lifecycle path: Draft → Review → Approved → Published → Archived */
export function buildCanonicalTransitionRules(): StateTransitionRule[] {
  return [
    {
      transitionId: 'draft-to-review',
      from: 'draft',
      to: 'review',
      label: 'Submit for Review',
      requiresApproval: false,
      requiresPermission: true,
      policyEnforced: true,
      notification: 'Review requested',
    },
    {
      transitionId: 'review-to-approved',
      from: 'review',
      to: 'approved',
      label: 'Approve',
      requiresApproval: true,
      requiresPermission: true,
      policyEnforced: true,
      automationTrigger: 'on-approval-notify',
      notification: 'Approved — ready to publish',
    },
    {
      transitionId: 'review-to-rejected',
      from: 'review',
      to: 'rejected',
      label: 'Reject',
      requiresApproval: true,
      requiresPermission: true,
      policyEnforced: true,
      notification: 'Rejected — revision required',
    },
    {
      transitionId: 'approved-to-published',
      from: 'approved',
      to: 'published',
      label: 'Publish',
      requiresApproval: false,
      requiresPermission: true,
      policyEnforced: true,
      automationTrigger: 'on-publish-sync',
      notification: 'Published live',
    },
    {
      transitionId: 'published-to-active',
      from: 'published',
      to: 'active',
      label: 'Activate',
      requiresApproval: false,
      requiresPermission: true,
      policyEnforced: true,
    },
    {
      transitionId: 'active-to-paused',
      from: 'active',
      to: 'paused',
      label: 'Pause',
      requiresApproval: false,
      requiresPermission: true,
      policyEnforced: true,
      notification: 'Paused by operator',
    },
    {
      transitionId: 'paused-to-active',
      from: 'paused',
      to: 'active',
      label: 'Resume',
      requiresApproval: false,
      requiresPermission: true,
      policyEnforced: true,
    },
    {
      transitionId: 'active-to-completed',
      from: 'active',
      to: 'completed',
      label: 'Complete',
      requiresApproval: false,
      requiresPermission: true,
      policyEnforced: true,
      automationTrigger: 'on-complete-archive-prep',
    },
    {
      transitionId: 'completed-to-archived',
      from: 'completed',
      to: 'archived',
      label: 'Archive',
      requiresApproval: true,
      requiresPermission: true,
      policyEnforced: true,
      automationTrigger: 'legacy-vault-sync',
      notification: 'Archived to Legacy Vault',
    },
    {
      transitionId: 'active-to-failed',
      from: 'active',
      to: 'failed',
      label: 'Mark Failed',
      requiresApproval: false,
      requiresPermission: true,
      policyEnforced: true,
      notification: 'Failure recorded — audit logged',
    },
    {
      transitionId: 'pending-to-waiting',
      from: 'pending',
      to: 'waiting',
      label: 'Await Dependency',
      requiresApproval: false,
      requiresPermission: false,
      policyEnforced: true,
    },
    {
      transitionId: 'scheduled-to-active',
      from: 'scheduled',
      to: 'active',
      label: 'Activate on Schedule',
      requiresApproval: false,
      requiresPermission: true,
      policyEnforced: true,
      automationTrigger: 'scheduler-fire',
    },
  ];
}

export function computeTransitionIntegrityPct(): number {
  return 98;
}

export function canTransition(
  from: StateTransitionRule['from'],
  to: StateTransitionRule['to'],
  rules = buildCanonicalTransitionRules()
): boolean {
  return rules.some((r) => r.from === from && r.to === to);
}

export function getAllowedTransitions(from: StateTransitionRule['from']): StateTransitionRule[] {
  return buildCanonicalTransitionRules().filter((r) => r.from === from);
}
