import {
  submitStudioInteraction,
  completeStudioInteraction,
  failStudioInteraction,
} from '../interactions/engine';
import {
  activateStudioWorkflow,
  getStudioWorkflow,
  registerStudioWorkflow,
  updateWorkflowStepStatus,
} from './registry';
import { emitStudioEvent } from '../events/bus';
import type { CanonicalInteractionTypeId } from '../constants';
import type { StudioWorkflow } from '../types';

export type WorkflowCompositionStep = {
  interactionType: CanonicalInteractionTypeId | string;
  label: string;
  optional?: boolean;
};

/** Workflow Composer™ — assemble workflows from interaction primitives */
export function composeStudioWorkflow(input: {
  officialName: string;
  description: string;
  ownerObjectId: string;
  initiatorObjectId: string;
  recipientObjectId: string;
  steps: WorkflowCompositionStep[];
  triggerInteractionType?: CanonicalInteractionTypeId | string;
}): StudioWorkflow {
  return registerStudioWorkflow({
    officialName: input.officialName,
    description: input.description,
    ownerObjectId: input.ownerObjectId,
    triggerInteractionType: input.triggerInteractionType,
    steps: input.steps.map((step, index) => ({
      order: index + 1,
      interactionType: step.interactionType,
      label: step.label,
      optional: step.optional,
    })),
  });
}

/** Orchestrate workflow without hardcoded subsystem dependencies */
export function runStudioWorkflowStep(input: {
  workflowId: string;
  stepId: string;
  initiatorObjectId: string;
  recipientObjectId: string;
  inputs?: { name: string; sourceObjectId?: string; value?: unknown; required?: boolean }[];
}): { workflow: StudioWorkflow | undefined; interactionId?: string } {
  const workflow = getStudioWorkflow(input.workflowId);
  if (!workflow) return { workflow: undefined };

  const step = workflow.steps.find((s) => s.stepId === input.stepId);
  if (!step) return { workflow };

  updateWorkflowStepStatus(input.workflowId, input.stepId, 'running');

  const interaction = submitStudioInteraction({
    interactionType: step.interactionType,
    officialName: step.label,
    initiatorObjectId: input.initiatorObjectId,
    recipientObjectId: input.recipientObjectId,
    inputs: input.inputs,
    workflowId: input.workflowId,
    correlationId: input.workflowId,
  });

  updateWorkflowStepStatus(input.workflowId, input.stepId, 'running', interaction.interactionId);

  return { workflow: getStudioWorkflow(input.workflowId), interactionId: interaction.interactionId };
}

export function completeStudioWorkflowStep(
  workflowId: string,
  stepId: string,
  interactionId: string
): StudioWorkflow | undefined {
  completeStudioInteraction(interactionId);
  updateWorkflowStepStatus(workflowId, stepId, 'completed', interactionId);

  const workflow = getStudioWorkflow(workflowId);
  if (!workflow) return undefined;

  const allDone = workflow.steps.every(
    (s) => s.status === 'completed' || s.status === 'skipped' || s.optional
  );

  if (allDone) {
    emitStudioEvent({
      officialName: 'Workflow Completed',
      eventType: 'workflow.completed',
      category: 'system',
      sourceObjectId: workflow.ownerObjectId,
      actorObjectId: workflow.ownerObjectId,
      affectedObjectIds: [workflow.ownerObjectId],
      payload: { workflowId },
      correlationId: workflowId,
    });
  }

  return getStudioWorkflow(workflowId);
}

export function failStudioWorkflowStep(
  workflowId: string,
  stepId: string,
  interactionId: string,
  reason: string
): StudioWorkflow | undefined {
  failStudioInteraction(interactionId, reason);
  updateWorkflowStepStatus(workflowId, stepId, 'failed', interactionId);
  return getStudioWorkflow(workflowId);
}

export function startComposedWorkflow(
  workflowId: string,
  initiatorObjectId: string,
  recipientObjectId: string
): StudioWorkflow | undefined {
  activateStudioWorkflow(workflowId);
  const workflow = getStudioWorkflow(workflowId);
  if (!workflow || workflow.steps.length === 0) return workflow;

  const first = workflow.steps[0];
  runStudioWorkflowStep({
    workflowId,
    stepId: first.stepId,
    initiatorObjectId,
    recipientObjectId,
  });

  return getStudioWorkflow(workflowId);
}
