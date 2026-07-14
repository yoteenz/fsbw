import type { EnvironmentPackageEventType } from './EnvironmentPackageEvent';

/** Targeted workspace selectors — never refetch entire page. */
export type WorkspaceDataSelector =
  | 'active-package'
  | 'package-outputs'
  | 'package-health'
  | 'blueprint-display'
  | 'design-brief'
  | 'founder-review-wall'
  | 'revision-timeline'
  | 'architectural-tools'
  | 'material-library'
  | 'asset-reference'
  | 'budget-forecast'
  | 'workforce-center'
  | 'permit-center'
  | 'approval-bridge'
  | 'package-readiness'
  | 'generation-jobs';

const EVENT_INVALIDATION_MATRIX: Partial<Record<EnvironmentPackageEventType | string, WorkspaceDataSelector[]>> = {
  BLUEPRINT_UPDATED: [
    'active-package',
    'package-outputs',
    'blueprint-display',
    'architectural-tools',
    'design-brief',
    'founder-review-wall',
    'revision-timeline',
    'package-health',
    'approval-bridge',
  ],
  OUTPUT_GENERATING: [
    'package-outputs',
    'blueprint-display',
    'architectural-tools',
    'design-brief',
    'revision-timeline',
    'generation-jobs',
  ],
  OUTPUT_GENERATED: [
    'active-package',
    'package-outputs',
    'blueprint-display',
    'architectural-tools',
    'design-brief',
    'founder-review-wall',
    'revision-timeline',
    'package-health',
    'approval-bridge',
  ],
  OUTPUT_FAILED: [
    'package-outputs',
    'blueprint-display',
    'architectural-tools',
    'design-brief',
    'revision-timeline',
    'approval-bridge',
  ],
  OUTPUT_STALE: ['package-outputs', 'blueprint-display', 'architectural-tools', 'approval-bridge'],
  MATERIALS_UPDATED: ['package-outputs', 'material-library', 'design-brief'],
  CONSTRUCTION_UPDATED: ['package-outputs', 'architectural-tools'],
  BUDGET_UPDATED: ['budget-forecast', 'design-brief', 'package-health'],
  ACTUAL_COST_UPDATED: ['budget-forecast', 'design-brief', 'package-health'],
  ESTIMATE_CREATED: ['budget-forecast', 'design-brief', 'permit-center'],
  ESTIMATE_ACCEPTED: ['budget-forecast', 'permit-center', 'approval-bridge'],
  READINESS_UPDATED: ['package-readiness', 'permit-center', 'design-brief', 'approval-bridge', 'package-health'],
  BLOCKER_ADDED: ['package-readiness', 'permit-center', 'design-brief', 'approval-bridge'],
  BLOCKER_RESOLVED: ['package-readiness', 'permit-center', 'design-brief', 'approval-bridge'],
  PRODUCTION_APPROVED: ['package-readiness', 'permit-center', 'approval-bridge', 'generation-jobs'],
  REVISION_CREATED: ['founder-review-wall', 'revision-timeline', 'design-brief'],
  REVISION_COMPLETED: ['founder-review-wall', 'revision-timeline', 'design-brief', 'active-package', 'approval-bridge'],
  FOUNDER_DECISION_RECORDED: ['founder-review-wall', 'revision-timeline', 'approval-bridge'],
  FOUNDER_COMMENT_ADDED: ['founder-review-wall'],
  PACKAGE_PROMOTED_TO_CANONICAL: ['active-package', 'founder-review-wall', 'revision-timeline', 'approval-bridge', 'permit-center'],
  PACKAGE_STATUS_CHANGED: ['active-package', 'design-brief', 'package-health'],
  PACKAGE_HEALTH_CHANGED: ['package-health', 'design-brief', 'approval-bridge'],
  GENERATION_JOB_STARTED: ['generation-jobs', 'revision-timeline', 'workforce-center'],
  GENERATION_JOB_PROGRESS: ['generation-jobs', 'blueprint-display', 'architectural-tools'],
  GENERATION_JOB_COMPLETED: ['generation-jobs', 'revision-timeline', 'workforce-center', 'package-outputs'],
  GENERATION_JOB_FAILED: ['generation-jobs', 'revision-timeline', 'workforce-center', 'approval-bridge'],
  ACTIVE_VARIANT_CHANGED: [
    'active-package',
    'package-outputs',
    'blueprint-display',
    'design-brief',
    'founder-review-wall',
    'revision-timeline',
    'architectural-tools',
    'material-library',
    'asset-reference',
    'budget-forecast',
    'workforce-center',
    'permit-center',
    'approval-bridge',
    'package-readiness',
    'generation-jobs',
  ],
  ACTIVE_PACKAGE_CHANGED: [
    'active-package',
    'package-outputs',
    'blueprint-display',
    'design-brief',
    'founder-review-wall',
    'revision-timeline',
    'approval-bridge',
    'package-readiness',
  ],
};

export function resolveInvalidationsForEvent(eventType: string): WorkspaceDataSelector[] {
  const direct = EVENT_INVALIDATION_MATRIX[eventType];
  if (direct) return [...new Set(direct)];
  if (eventType.startsWith('OUTPUT_')) return ['package-outputs', 'design-brief'];
  if (eventType.startsWith('GENERATION_')) return ['generation-jobs', 'revision-timeline'];
  if (eventType.startsWith('ACTIVE_')) return ['active-package'];
  return ['active-package'];
}

export function shouldThrottleProgressEvent(eventType: string): boolean {
  return eventType === 'GENERATION_JOB_PROGRESS' || eventType === 'OUTPUT_GENERATING';
}
