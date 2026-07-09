import { INITIAL_GENESIS_VERSION } from '../../versioning/semver';
import { mutateInteractionModelStore, readInteractionModelStore } from '../persistence';
import { recordAuditEntry } from '../audit/engine';
import type {
  InteractionPriority,
  InteractionStatus,
  InteractionVisibility,
  CanonicalInteractionTypeId,
  RetryStrategy,
} from '../constants';
import type {
  InteractionInput,
  InteractionOutput,
  InteractionParticipant,
  StudioInteraction,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

export function createInteractionId(type: string, slug: string): string {
  const typeToken = type.toUpperCase().replace(/-/g, '-');
  const slugToken = (slug.trim() || 'interaction')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `INT-${typeToken}-${slugToken}-${Date.now().toString(36)}`;
}

export type SubmitInteractionInput = {
  interactionType: CanonicalInteractionTypeId | string;
  officialName: string;
  initiatorObjectId: string;
  recipientObjectId: string;
  slug?: string;
  purpose?: string;
  participants?: InteractionParticipant[];
  inputs?: InteractionInput[];
  outputs?: InteractionOutput[];
  priority?: InteractionPriority;
  visibility?: InteractionVisibility;
  retryStrategy?: RetryStrategy;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
  workflowId?: string;
  relationshipRefs?: string[];
};

/** Interaction Engine™ — submit and lifecycle manage interactions */
export function submitStudioInteraction(input: SubmitInteractionInput): StudioInteraction {
  const timestamp = now();
  const interactionType = input.interactionType.trim();

  const interaction: StudioInteraction = {
    interactionId: createInteractionId(interactionType, input.slug ?? input.officialName),
    interactionType,
    version: { ...INITIAL_GENESIS_VERSION },
    officialName: input.officialName.trim(),
    purpose: input.purpose,
    participants: input.participants ?? [
      { objectId: input.initiatorObjectId, role: 'initiator' },
      { objectId: input.recipientObjectId, role: 'recipient' },
    ],
    initiatorObjectId: input.initiatorObjectId,
    recipientObjectId: input.recipientObjectId,
    inputs: input.inputs ?? [],
    outputs: input.outputs ?? [],
    status: 'requested',
    priority: input.priority ?? 'normal',
    relationshipRefs: input.relationshipRefs ?? [],
    visibility: input.visibility ?? 'participant-visible',
    auditHistory: [],
    retryStrategy: input.retryStrategy ?? 'none',
    metadata: input.metadata ?? {},
    correlationId: input.correlationId,
    causationId: input.causationId,
    workflowId: input.workflowId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (!interaction.initiatorObjectId || !interaction.recipientObjectId) {
    throw new Error('Interaction requires initiator and recipient object IDs');
  }

  mutateInteractionModelStore((store) => ({
    ...store,
    interactions: [...store.interactions, interaction],
  }));

  recordAuditEntry({
    interactionId: interaction.interactionId,
    level: 'trace',
    action: 'interaction.submitted',
    actorObjectId: interaction.initiatorObjectId,
    subjectObjectIds: [interaction.recipientObjectId],
    visibility: interaction.visibility,
    details: { interactionType: interaction.interactionType, status: interaction.status },
  });

  return interaction;
}

export function getStudioInteraction(interactionId: string): StudioInteraction | undefined {
  return readInteractionModelStore().interactions.find((i) => i.interactionId === interactionId);
}

export function advanceStudioInteraction(
  interactionId: string,
  status: InteractionStatus,
  patch?: Partial<Pick<StudioInteraction, 'outputs' | 'metadata' | 'auditHistory'>>
): StudioInteraction | undefined {
  let updated: StudioInteraction | undefined;

  mutateInteractionModelStore((store) => {
    const idx = store.interactions.findIndex((i) => i.interactionId === interactionId);
    if (idx < 0) return store;

    updated = {
      ...store.interactions[idx],
      ...patch,
      status,
      updatedAt: now(),
    };

    const interactions = [...store.interactions];
    interactions[idx] = updated;
    return { ...store, interactions };
  });

  if (updated) {
    recordAuditEntry({
      interactionId,
      level: status === 'failed' ? 'event' : 'trace',
      action: `interaction.${status}`,
      actorObjectId: updated.initiatorObjectId,
      subjectObjectIds: [updated.recipientObjectId],
      visibility: updated.visibility,
      details: { status },
    });
  }

  return updated;
}

export function completeStudioInteraction(
  interactionId: string,
  outputs?: InteractionOutput[]
): StudioInteraction | undefined {
  return advanceStudioInteraction(interactionId, 'completed', { outputs });
}

export function failStudioInteraction(
  interactionId: string,
  reason: string,
  retryStrategy?: RetryStrategy
): StudioInteraction | undefined {
  let updated: StudioInteraction | undefined;

  mutateInteractionModelStore((store) => {
    const idx = store.interactions.findIndex((i) => i.interactionId === interactionId);
    if (idx < 0) return store;

    const current = store.interactions[idx];
    updated = {
      ...current,
      status: 'failed',
      metadata: { ...current.metadata, failureReason: reason },
      retryStrategy: retryStrategy ?? current.retryStrategy,
      updatedAt: now(),
    };

    const interactions = [...store.interactions];
    interactions[idx] = updated;
    return { ...store, interactions };
  });

  if (updated) {
    recordAuditEntry({
      interactionId,
      level: 'event',
      action: 'interaction.failed',
      actorObjectId: updated.initiatorObjectId,
      subjectObjectIds: [updated.recipientObjectId],
      visibility: updated.visibility,
      details: { reason, retryStrategy: updated.retryStrategy },
    });
  }

  return updated;
}

export function listCanonicalInteractionTypeIds(): string[] {
  return readInteractionModelStore()
    .interactions.map((i) => i.interactionType)
    .filter((v, i, a) => a.indexOf(v) === i);
}

export function validateInteractionEnvelope(interaction: StudioInteraction): string[] {
  const errors: string[] = [];
  if (!interaction.interactionId) errors.push('Missing interaction ID');
  if (!interaction.interactionType) errors.push('Missing interaction type');
  if (!interaction.initiatorObjectId) errors.push('Missing initiator');
  if (!interaction.recipientObjectId) errors.push('Missing recipient');
  return errors;
}

export function validateInteractionModelStore(): {
  valid: boolean;
  issues: { code: string; message: string; interactionId?: string }[];
} {
  const store = readInteractionModelStore();
  const issues: { code: string; message: string; interactionId?: string }[] = [];

  for (const interaction of store.interactions) {
    for (const message of validateInteractionEnvelope(interaction)) {
      issues.push({
        code: 'invalid-interaction',
        message,
        interactionId: interaction.interactionId,
      });
    }
  }

  for (const interaction of store.interactions) {
    if (interaction.workflowId && !store.workflows.some((w) => w.workflowId === interaction.workflowId)) {
      issues.push({
        code: 'orphan-workflow-ref',
        message: `Interaction references missing workflow ${interaction.workflowId}`,
        interactionId: interaction.interactionId,
      });
    }
  }

  return { valid: issues.length === 0, issues };
}
