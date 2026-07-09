import { mutateInteractionModelStore, readInteractionModelStore } from '../persistence';
import { submitStudioInteraction } from '../interactions/engine';
import type { StudioSynchronization } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createSyncId(): string {
  return `SYNC-${Date.now().toString(36)}`;
}

export function beginStudioSynchronization(input: {
  sourceObjectId: string;
  targetObjectId: string;
}): StudioSynchronization {
  const timestamp = now();

  const interaction = submitStudioInteraction({
    interactionType: 'synchronization',
    officialName: `Synchronize ${input.sourceObjectId} -> ${input.targetObjectId}`,
    initiatorObjectId: input.sourceObjectId,
    recipientObjectId: input.targetObjectId,
  });

  const sync: StudioSynchronization = {
    syncId: createSyncId(),
    sourceObjectId: input.sourceObjectId,
    targetObjectId: input.targetObjectId,
    interactionId: interaction.interactionId,
    status: 'pending',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateInteractionModelStore((store) => ({
    ...store,
    synchronizations: [...store.synchronizations, sync],
  }));

  return sync;
}

export function completeStudioSynchronization(syncId: string): StudioSynchronization | undefined {
  return updateSyncStatus(syncId, 'completed');
}

export function failStudioSynchronization(
  syncId: string,
  conflictReport?: string[]
): StudioSynchronization | undefined {
  return updateSyncStatus(syncId, conflictReport?.length ? 'conflict' : 'failed', conflictReport);
}

function updateSyncStatus(
  syncId: string,
  status: StudioSynchronization['status'],
  conflictReport?: string[]
): StudioSynchronization | undefined {
  let updated: StudioSynchronization | undefined;

  mutateInteractionModelStore((store) => {
    const idx = store.synchronizations.findIndex((s) => s.syncId === syncId);
    if (idx < 0) return store;

    updated = {
      ...store.synchronizations[idx],
      status,
      conflictReport,
      updatedAt: now(),
    };

    const synchronizations = [...store.synchronizations];
    synchronizations[idx] = updated;
    return { ...store, synchronizations };
  });

  return updated;
}

export function listStudioSynchronizations(): StudioSynchronization[] {
  return readInteractionModelStore().synchronizations;
}

export function listPendingSynchronizations(): StudioSynchronization[] {
  return listStudioSynchronizations().filter(
    (s) => s.status === 'pending' || s.status === 'in_progress'
  );
}
