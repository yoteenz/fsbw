import { submitStudioInteraction, type SubmitInteractionInput } from '../interactions/engine';
import { emitStudioEvent, type EmitStudioEventInput } from '../events/bus';
import { registerStudioWorkflow } from '../workflows/registry';
import { issueStudioCommand } from '../commands/registry';
import { registerStudioAutomation } from '../automation/automation';
import type { StudioInteraction, StudioEvent, StudioWorkflow } from '../types';

export type InteractionPayload = SubmitInteractionInput;

export type EventPayload = EmitStudioEventInput;

export type WorkflowPayload = Parameters<typeof registerStudioWorkflow>[0];

export type CommandPayload = Parameters<typeof issueStudioCommand>[0];

export type AutomationPayload = Parameters<typeof registerStudioAutomation>[0];

/** Batch ingest — zero engineering changes when payload matches schema */
export function ingestInteractionPayload(payload: InteractionPayload): StudioInteraction {
  return submitStudioInteraction(payload);
}

export function ingestEventPayload(payload: EventPayload): StudioEvent {
  return emitStudioEvent(payload);
}

export function ingestWorkflowPayload(payload: WorkflowPayload): StudioWorkflow {
  return registerStudioWorkflow(payload);
}

export function ingestInteractionBatch(payloads: InteractionPayload[]): {
  ingested: StudioInteraction[];
  errors: string[];
} {
  const ingested: StudioInteraction[] = [];
  const errors: string[] = [];

  for (const payload of payloads) {
    try {
      if (!payload.interactionType?.trim()) {
        errors.push('Missing interactionType');
        continue;
      }
      if (!payload.officialName?.trim() || !payload.initiatorObjectId || !payload.recipientObjectId) {
        errors.push('Missing required interaction fields');
        continue;
      }
      ingested.push(ingestInteractionPayload(payload));
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return { ingested, errors };
}
