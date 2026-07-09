import { INITIAL_GENESIS_VERSION } from '../../versioning/semver';
import { mutateInteractionModelStore, readInteractionModelStore } from '../persistence';
import type { StudioWorkflow, WorkflowStep } from '../types';
import type { CanonicalInteractionTypeId } from '../constants';

function now(): string {
  return new Date().toISOString();
}

function createWorkflowId(slug: string): string {
  const token = (slug.trim() || 'workflow')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `WFL-${token}-${Date.now().toString(36)}`;
}

/** Workflow Registry™ */
export function listWorkflowRegistry(): StudioWorkflow[] {
  return readInteractionModelStore().workflows;
}

export function getStudioWorkflow(workflowId: string): StudioWorkflow | undefined {
  return readInteractionModelStore().workflows.find((w) => w.workflowId === workflowId);
}

export function registerStudioWorkflow(input: {
  officialName: string;
  description: string;
  ownerObjectId: string;
  slug?: string;
  triggerInteractionType?: CanonicalInteractionTypeId | string;
  steps?: Omit<WorkflowStep, 'stepId' | 'status'>[];
  metadata?: Record<string, unknown>;
}): StudioWorkflow {
  const timestamp = now();
  const workflow: StudioWorkflow = {
    workflowId: createWorkflowId(input.slug ?? input.officialName),
    officialName: input.officialName.trim(),
    description: input.description.trim(),
    version: { ...INITIAL_GENESIS_VERSION },
    triggerInteractionType: input.triggerInteractionType,
    steps: (input.steps ?? []).map((step, index) => ({
      ...step,
      stepId: `step-${index + 1}`,
      order: step.order ?? index + 1,
      status: 'pending' as const,
    })),
    status: 'draft',
    ownerObjectId: input.ownerObjectId,
    metadata: input.metadata ?? {},
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateInteractionModelStore((store) => ({
    ...store,
    workflows: [...store.workflows, workflow],
  }));

  return workflow;
}

export function updateWorkflowStepStatus(
  workflowId: string,
  stepId: string,
  status: WorkflowStep['status'],
  interactionId?: string
): StudioWorkflow | undefined {
  let updated: StudioWorkflow | undefined;

  mutateInteractionModelStore((store) => {
    const idx = store.workflows.findIndex((w) => w.workflowId === workflowId);
    if (idx < 0) return store;

    const workflow = store.workflows[idx];
    updated = {
      ...workflow,
      steps: workflow.steps.map((s) =>
        s.stepId === stepId ? { ...s, status, interactionId: interactionId ?? s.interactionId } : s
      ),
      updatedAt: now(),
    };

    const workflows = [...store.workflows];
    workflows[idx] = updated;
    return { ...store, workflows };
  });

  return updated;
}

export function activateStudioWorkflow(workflowId: string): StudioWorkflow | undefined {
  let updated: StudioWorkflow | undefined;

  mutateInteractionModelStore((store) => {
    const idx = store.workflows.findIndex((w) => w.workflowId === workflowId);
    if (idx < 0) return store;

    updated = {
      ...store.workflows[idx],
      status: 'active',
      updatedAt: now(),
    };

    const workflows = [...store.workflows];
    workflows[idx] = updated;
    return { ...store, workflows };
  });

  return updated;
}

export function listActiveWorkflows(): StudioWorkflow[] {
  return listWorkflowRegistry().filter((w) => w.status === 'active');
}
