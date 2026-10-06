import type { DemoStore } from '../../demo/demoTypes';
import type { ExtractedFactRecord, MigrationReviewAction } from '../types';
import { transitionClientLifecycle } from './lifecycleEvents';
import { provisionPrebuiltClientOffice } from './officeProvisioningService';

function uid(): string {
  return crypto.randomUUID();
}

export function recordExtractedFacts(
  store: DemoStore,
  facts: Omit<ExtractedFactRecord, 'id' | 'createdAt'>[],
): DemoStore {
  if (!store.clientExtractedFacts) store.clientExtractedFacts = [];
  for (const fact of facts) {
    store.clientExtractedFacts.push({
      ...fact,
      id: uid(),
      createdAt: new Date().toISOString(),
    });
  }
  return store;
}

export function applyReviewActionToFact(
  store: DemoStore,
  factId: string,
  action: MigrationReviewAction,
  staffId: string,
): DemoStore {
  const fact = store.clientExtractedFacts?.find((f) => f.id === factId);
  if (!fact) return store;
  fact.reviewAction = action;
  if (action === 'REJECT') {
    fact.proposedValue = '';
  }
  store.activity.unshift({
    id: uid(),
    kind: 'DOCUMENT_VERIFIED',
    title: `Migration fact ${action} — ${fact.fieldKey}`,
    clientId: fact.organizationId,
    staffId,
    createdAt: new Date().toISOString(),
    visibility: 'internal',
  });
  return store;
}

/** Idempotent APPROVE MIGRATION — PREBUILT only, never ACTIVE. */
export function commitApprovedMigration(
  store: DemoStore,
  batchId: string,
  staffId: string,
  idempotencyKey?: string,
): { store: DemoStore; error?: string } {
  const key = idempotencyKey ?? `approve-migration:${batchId}`;
  if (!store.clientMigrationCommitKeys) store.clientMigrationCommitKeys = [];
  if (store.clientMigrationCommitKeys.includes(key)) {
    return { store };
  }

  const batch = store.archiveMigrationBatches?.find((b) => b.id === batchId);
  if (!batch) return { store, error: 'Batch not found' };

  const facts = (store.clientExtractedFacts ?? []).filter((f) => f.batchId === batchId);
  const ambiguous = facts.some((f) => f.confidence === 'CONFLICT' && !f.reviewAction);
  if (ambiguous) return { store, error: 'Unresolved conflicts remain' };

  const rejectedCommitted = facts.some((f) => f.reviewAction === 'REJECT' && f.proposedValue);
  if (rejectedCommitted) return { store, error: 'Rejected facts must not commit' };

  store.clientMigrationCommitKeys.push(key);

  const client = store.clients.find((c) => c.id === batch.clientId);
  const services = client?.services ?? [];

  store = provisionPrebuiltClientOffice(store, batch.clientId, services);
  store = transitionClientLifecycle(store, batch.clientId, 'PREBUILT', 'MIGRATION_APPROVED', 'STAFF', staffId);

  if (client) {
    client.clientReviewState = 'REQUIRED';
    client.profileCompletenessPct = Math.min(100, (client.profileCompletenessPct ?? 40) + 35);
    client.accountStatus = 'pending';
  }

  return { store };
}
