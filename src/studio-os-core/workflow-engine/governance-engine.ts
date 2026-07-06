import type { WorkflowGovernanceFinding } from './types';

export function runWorkflowGovernanceAudit(): WorkflowGovernanceFinding[] {
  return [
    {
      id: 'gov-test-before-publish',
      severity: 'critical',
      message: 'Nothing goes live without testing — Preview, Simulate, and Validate required.',
      recommendation: 'Complete all required testing modes before publishing workflow.',
    },
    {
      id: 'gov-policy-permission',
      severity: 'warning',
      message: 'Approval nodes must declare Permission Engine capability requirements.',
      recommendation: 'Run Validate testing mode to verify policy and permission compliance.',
    },
    {
      id: 'gov-automation-registry',
      severity: 'info',
      message: 'Automation nodes must be registered in Automation Registry™ before production.',
      recommendation: 'Link workflow Automation nodes to registered automation IDs.',
    },
    {
      id: 'gov-living-systems',
      severity: 'info',
      message: 'Published workflows sync analytics continuously — review optimization suggestions monthly.',
      recommendation: 'Schedule quarterly workflow review with Executive Council.',
    },
  ];
}

export function computeBuilderReadyPct(nodeCount: number): number {
  return Math.min(99, 85 + Math.floor(nodeCount / 3));
}
