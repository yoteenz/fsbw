import type { EnvironmentPackageEvent, EnvironmentPackageEventCursor } from './EnvironmentPackageEvent';

const seenEventIds = new Set<string>();
const sequenceByPackage = new Map<string, number>();

export function createInitialEventCursor(packageId: string | null): EnvironmentPackageEventCursor {
  return {
    packageId,
    lastEventId: null,
    lastSequence: 0,
    lastOccurredAt: null,
    connectionState: packageId ? 'connecting' : 'disconnected',
    missingSequenceCount: 0,
    duplicateEventCount: 0,
    recoveryCount: 0,
    lastRecoveryAt: null,
    lastInvalidationSet: [],
    processingErrors: 0,
  };
}

export type ProcessEventResult =
  | { action: 'accept'; cursor: EnvironmentPackageEventCursor; gapDetected: boolean }
  | { action: 'duplicate'; cursor: EnvironmentPackageEventCursor }
  | { action: 'reject'; cursor: EnvironmentPackageEventCursor; reason: string };

export function processEnvironmentPackageEvent(
  cursor: EnvironmentPackageEventCursor,
  event: EnvironmentPackageEvent
): ProcessEventResult {
  if (cursor.packageId && event.packageId !== cursor.packageId) {
    return {
      action: 'reject',
      cursor: { ...cursor, processingErrors: cursor.processingErrors + 1 },
      reason: 'wrong-package',
    };
  }

  if (seenEventIds.has(event.eventId)) {
    return {
      action: 'duplicate',
      cursor: { ...cursor, duplicateEventCount: cursor.duplicateEventCount + 1 },
    };
  }

  seenEventIds.add(event.eventId);

  let gapDetected = false;
  let missingSequenceCount = cursor.missingSequenceCount;

  if (event.sequence > cursor.lastSequence + 1 && cursor.lastSequence > 0) {
    gapDetected = true;
    missingSequenceCount += event.sequence - cursor.lastSequence - 1;
  }

  const nextCursor: EnvironmentPackageEventCursor = {
    ...cursor,
    lastEventId: event.eventId,
    lastSequence: Math.max(cursor.lastSequence, event.sequence),
    lastOccurredAt: event.occurredAt,
    missingSequenceCount,
  };

  sequenceByPackage.set(event.packageId, nextCursor.lastSequence);

  return { action: 'accept', cursor: nextCursor, gapDetected };
}

export function nextLocalEventSequence(packageId: string): number {
  const current = sequenceByPackage.get(packageId) ?? 0;
  const next = current + 1;
  sequenceByPackage.set(packageId, next);
  return next;
}

export function resetEnvironmentPackageEventProcessor(): void {
  seenEventIds.clear();
  sequenceByPackage.clear();
}
