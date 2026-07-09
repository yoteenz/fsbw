import { mutateInteractionModelStore, readInteractionModelStore } from '../persistence';
import type { CanonicalInteractionTypeId } from '../constants';
import type { StudioAutomation } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createAutomationId(slug: string): string {
  const token = (slug.trim() || 'automation')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `AUT-${token}-${Date.now().toString(36)}`;
}

export function registerStudioAutomation(input: {
  officialName: string;
  ownerObjectId: string;
  triggerEventType?: string;
  triggerInteractionType?: CanonicalInteractionTypeId | string;
  workflowId?: string;
  conditions?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  enabled?: boolean;
}): StudioAutomation {
  const timestamp = now();
  const automation: StudioAutomation = {
    automationId: createAutomationId(input.officialName),
    officialName: input.officialName.trim(),
    triggerEventType: input.triggerEventType,
    triggerInteractionType: input.triggerInteractionType,
    workflowId: input.workflowId,
    ownerObjectId: input.ownerObjectId,
    enabled: input.enabled ?? true,
    conditions: input.conditions ?? {},
    metadata: input.metadata ?? {},
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateInteractionModelStore((store) => ({
    ...store,
    automations: [...store.automations, automation],
  }));

  return automation;
}

export function listStudioAutomations(enabledOnly = false): StudioAutomation[] {
  const automations = readInteractionModelStore().automations;
  return enabledOnly ? automations.filter((a) => a.enabled) : automations;
}

export function setAutomationEnabled(
  automationId: string,
  enabled: boolean
): StudioAutomation | undefined {
  let updated: StudioAutomation | undefined;

  mutateInteractionModelStore((store) => {
    const idx = store.automations.findIndex((a) => a.automationId === automationId);
    if (idx < 0) return store;

    updated = {
      ...store.automations[idx],
      enabled,
      updatedAt: now(),
    };

    const automations = [...store.automations];
    automations[idx] = updated;
    return { ...store, automations };
  });

  return updated;
}

export function findAutomationsForEvent(eventType: string): StudioAutomation[] {
  return listStudioAutomations(true).filter((a) => a.triggerEventType === eventType);
}

export function findAutomationsForInteractionType(
  interactionType: string
): StudioAutomation[] {
  return listStudioAutomations(true).filter((a) => a.triggerInteractionType === interactionType);
}
