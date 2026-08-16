import type {
  IntegrationOperationStatus,
  IntegrationSyncCursor,
  IntegrationSyncDirection,
  IntegrationSyncJob,
  IntegrationSyncType,
} from './integrationTypes';

export interface SyncOwnershipPolicy {
  entityType: string;
  direction: IntegrationSyncDirection;
  canonicalOwner: 'ALL_IN_ONE' | 'EXTERNAL' | 'FIELD_POLICY';
  conflictPolicy: 'EXTERNAL_UPDATE_AVAILABLE' | 'REVIEW_CONFLICT' | 'SOURCE_OF_TRUTH_EXTERNAL' | 'SOURCE_OF_TRUTH_ALL_IN_ONE';
}

export const DEFAULT_SYNC_POLICIES: SyncOwnershipPolicy[] = [
  {
    entityType: 'carrier_regulatory',
    direction: 'IMPORT_ONLY',
    canonicalOwner: 'EXTERNAL',
    conflictPolicy: 'EXTERNAL_UPDATE_AVAILABLE',
  },
  {
    entityType: 'invoice',
    direction: 'EXPORT_ONLY',
    canonicalOwner: 'ALL_IN_ONE',
    conflictPolicy: 'REVIEW_CONFLICT',
  },
  {
    entityType: 'load_board_candidate',
    direction: 'IMPORT_ONLY',
    canonicalOwner: 'ALL_IN_ONE',
    conflictPolicy: 'SOURCE_OF_TRUTH_ALL_IN_ONE',
  },
];

export function advanceSyncCursor(
  cursor: IntegrationSyncCursor,
  patch: Partial<IntegrationSyncCursor>,
): IntegrationSyncCursor {
  return {
    ...cursor,
    ...patch,
    lastSyncedAt: patch.lastSyncedAt ?? new Date().toISOString(),
  };
}

export function createSyncJob(
  connectionId: string,
  syncType: IntegrationSyncType,
  direction: IntegrationSyncDirection,
  entityType: string,
): IntegrationSyncJob {
  return {
    id: crypto.randomUUID(),
    connectionId,
    syncType,
    direction,
    entityType,
    status: 'PENDING',
    startedAt: new Date().toISOString(),
    recordsProcessed: 0,
    recordsFailed: 0,
  };
}

export function finalizeSyncJob(
  job: IntegrationSyncJob,
  status: IntegrationOperationStatus,
  processed: number,
  failed: number,
  cursorId?: string,
): IntegrationSyncJob {
  return {
    ...job,
    status,
    recordsProcessed: processed,
    recordsFailed: failed,
    completedAt: new Date().toISOString(),
    cursorId,
  };
}

export function supportsIncrementalSync(cursor?: IntegrationSyncCursor): boolean {
  return Boolean(cursor?.providerCursor || cursor?.pageToken || cursor?.updatedSince);
}
