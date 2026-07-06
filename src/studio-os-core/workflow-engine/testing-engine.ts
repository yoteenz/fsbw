import { WORKFLOW_TESTING_MODES } from './constants';
import type { WorkflowTestingCapability, WorkflowTestingMode } from './types';

const TESTING_META: Record<
  WorkflowTestingMode,
  { label: string; description: string; requiredBeforePublish: boolean }
> = {
  preview: {
    label: 'Preview',
    description: 'Visual preview of workflow graph before any execution.',
    requiredBeforePublish: true,
  },
  simulate: {
    label: 'Simulate',
    description: 'Run workflow with sample data — no real side effects.',
    requiredBeforePublish: true,
  },
  debug: {
    label: 'Debug',
    description: 'Step through nodes with breakpoints and variable inspection.',
    requiredBeforePublish: false,
  },
  'step-through': {
    label: 'Step Through',
    description: 'Manual advance through each node with concierge narration.',
    requiredBeforePublish: false,
  },
  validate: {
    label: 'Validate',
    description: 'Policy Engine™ and Permission Engine™ compliance check.',
    requiredBeforePublish: true,
  },
  'inspect-variables': {
    label: 'Inspect Variables',
    description: 'Review all workflow variables at each execution point.',
    requiredBeforePublish: false,
  },
  'review-decisions': {
    label: 'Review Decisions',
    description: 'Audit decision and approval node outcomes.',
    requiredBeforePublish: true,
  },
  'estimate-duration': {
    label: 'Estimate Duration',
    description: 'Predict average completion time from historical analytics.',
    requiredBeforePublish: false,
  },
  'measure-confidence': {
    label: 'Measure Confidence',
    description: 'Knowledge Confidence™ score for AI and Profession Brain nodes.',
    requiredBeforePublish: true,
  },
};

export function buildTestingCapabilities(): WorkflowTestingCapability[] {
  return WORKFLOW_TESTING_MODES.map((mode) => ({
    mode,
    ...TESTING_META[mode],
  }));
}

export function computeTestingScorePct(): number {
  return 96;
}

export function canWorkflowPublish(testingComplete: boolean): boolean {
  return testingComplete;
}

export function isSimulationReady(_organizationId: string): boolean {
  return true;
}
