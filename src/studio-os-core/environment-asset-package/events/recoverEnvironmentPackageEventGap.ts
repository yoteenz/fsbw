import type { EnvironmentPackageEvent, EnvironmentPackageEventCursor } from './EnvironmentPackageEvent';
import { mapAuditRowToEnvironmentPackageEvent } from './mapAuditRowToEvent';
import type { FetchPackageEventsFn } from './EnvironmentPackageRealtimeClient';

export type RecoverEventGapInput = {
  packageId: string;
  cursor: EnvironmentPackageEventCursor;
  fetchEvents: FetchPackageEventsFn;
  fetchPackageStatus?: (packageId: string) => Promise<{ ok: boolean }>;
};

export type RecoverEventGapResult = {
  recovered: boolean;
  events: EnvironmentPackageEvent[];
  cursor: EnvironmentPackageEventCursor;
  error?: string;
};

/** Targeted recovery when sequence gaps, reconnect, or visibility resume are detected. */
export async function recoverEnvironmentPackageEventGap(
  input: RecoverEventGapInput
): Promise<RecoverEventGapResult> {
  const { packageId, cursor, fetchEvents } = input;
  const afterSequence = cursor.lastSequence;

  const result = await fetchEvents({ packageId, afterSequence });
  if (!result.ok) {
    return {
      recovered: false,
      events: [],
      cursor: {
        ...cursor,
        connectionState: 'degraded',
        processingErrors: cursor.processingErrors + 1,
      },
      error: result.error,
    };
  }

  if (input.fetchPackageStatus) {
    await input.fetchPackageStatus(packageId);
  }

  const events = result.events
    .map((row) => (row.eventId ? row : mapAuditRowToEnvironmentPackageEvent(row as unknown as Record<string, unknown>)))
    .filter((e) => e.packageId === packageId)
    .sort((a, b) => a.sequence - b.sequence);

  const latestSequence = events.length
    ? Math.max(...events.map((e) => e.sequence))
    : result.latestSequence ?? cursor.lastSequence;

  return {
    recovered: true,
    events,
    cursor: {
      ...cursor,
      packageId,
      lastSequence: Math.max(cursor.lastSequence, latestSequence),
      connectionState: 'connected',
      recoveryCount: cursor.recoveryCount + 1,
      lastRecoveryAt: new Date().toISOString(),
    },
  };
}
