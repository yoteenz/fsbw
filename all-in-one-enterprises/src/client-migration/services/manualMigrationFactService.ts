import { isSupabaseMode } from '../../config/dataMode';
import { formatManualFactSourceReference } from '../manualFactSource';
import { recordExtractedFacts } from './migrationCommitService';
import type { DemoStore } from '../../demo/demoTypes';
import { supabaseInsertExtractedFacts } from '../repositories/supabaseMigrationRepository';

export async function addManualMigrationFact(input: {
  batchId: string;
  organizationId: string;
  entityType: string;
  fieldKey: string;
  proposedValue: string;
  staffUserId: string;
  batchFileId?: string;
  documentId?: string;
  store?: DemoStore;
}): Promise<{ ok: boolean; error?: string }> {
  const value = input.proposedValue.trim();
  if (!value) return { ok: false, error: 'Value is required' };

  const sourceReference = formatManualFactSourceReference({
    batchFileId: input.batchFileId,
    enteredByUserId: input.staffUserId,
  });

  if (isSupabaseMode()) {
    await supabaseInsertExtractedFacts([
      {
        batchId: input.batchId,
        organizationId: input.organizationId,
        documentId: input.documentId,
        entityType: input.entityType,
        fieldKey: input.fieldKey,
        proposedValue: value,
        confidence: 'HIGH',
        sourceReference,
        reviewAction: 'CONFIRM',
      },
    ]);
    return { ok: true };
  }

  if (!input.store) return { ok: false, error: 'Demo store required' };
  recordExtractedFacts(input.store, [
    {
      batchId: input.batchId,
      organizationId: input.organizationId,
      documentId: input.documentId,
      entityType: input.entityType,
      fieldKey: input.fieldKey,
      proposedValue: value,
      confidence: 'HIGH',
      sourceReference,
      reviewAction: 'CONFIRM',
    },
  ]);
  return { ok: true };
}

/** Demo-only synchronous helper for updateDemoStore callbacks. */
export function recordManualMigrationFactOnDemoStore(
  store: DemoStore,
  input: Omit<Parameters<typeof addManualMigrationFact>[0], 'store'>,
): DemoStore {
  const value = input.proposedValue.trim();
  if (!value) return store;
  const sourceReference = formatManualFactSourceReference({
    batchFileId: input.batchFileId,
    enteredByUserId: input.staffUserId,
  });
  return recordExtractedFacts(store, [
    {
      batchId: input.batchId,
      organizationId: input.organizationId,
      documentId: input.documentId,
      entityType: input.entityType,
      fieldKey: input.fieldKey,
      proposedValue: value,
      confidence: 'HIGH',
      sourceReference,
      reviewAction: 'CONFIRM',
    },
  ]);
}
