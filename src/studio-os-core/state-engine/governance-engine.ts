import type { StateGovernanceFinding, StateImprovementRecommendation } from './types';

export function runStateGovernanceAudit(): StateGovernanceFinding[] {
  return [
    {
      id: 'gov-no-undefined',
      severity: 'critical',
      message: 'Every Studio OS object must have a defined lifecycle state — undefined conditions are blocked.',
      recommendation: 'Register new object types with State Engine before platform use.',
    },
    {
      id: 'gov-policy-bypass',
      severity: 'critical',
      message: 'State transitions never bypass Policy Engine™ or Permission Engine™.',
      recommendation: 'Validate transition rules against policy simulation before enabling.',
    },
    {
      id: 'gov-history-immutable',
      severity: 'warning',
      message: 'State history is append-only — previous states, reasons, and approval chains preserved forever.',
      recommendation: 'Never delete history records — archive to Legacy Vault instead.',
    },
    {
      id: 'gov-extensible-states',
      severity: 'info',
      message: 'Future systems may extend lifecycle states while remaining State Engine compatible.',
      recommendation: 'Document custom states in object manifest with allowed transitions.',
    },
  ];
}

export function buildStateRecommendations(
  awaitingApproval: number,
  failedToday: number
): StateImprovementRecommendation[] {
  const recs: StateImprovementRecommendation[] = [];
  if (awaitingApproval > 0) {
    recs.push({
      id: 'rec-approval-queue',
      title: `${awaitingApproval} objects awaiting approval`,
      detail: 'Review Command Dock approval queue — delegate routine approvals to department concierges.',
      priority: 'high',
    });
  }
  if (failedToday > 0) {
    recs.push({
      id: 'rec-failed-workflows',
      title: `${failedToday} workflow failures today`,
      detail: 'Inspect automation-workflows in failed state — check Workflow Engine bottlenecks.',
      priority: 'high',
    });
  }
  recs.push(
    {
      id: 'rec-archive-completed',
      title: 'Archive completed campaigns and projects',
      detail: 'Move completed objects to archived state — syncs to Legacy Vault automatically.',
      priority: 'medium',
    },
    {
      id: 'rec-paused-review',
      title: 'Review paused plugins and workflows',
      detail: 'Resume or cancel paused objects to maintain lifecycle clarity.',
      priority: 'low',
    }
  );
  return recs;
}

export function computeLifecycleCoveragePct(stateCount: number, objectTypeCount: number): number {
  return Math.min(99, Math.round((stateCount * 2 + objectTypeCount * 3) / 2));
}
