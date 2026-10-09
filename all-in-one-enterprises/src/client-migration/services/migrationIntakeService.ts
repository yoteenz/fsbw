import { isSupabaseMode } from '../../config/dataMode';
import { getAioSupabase } from '../../data/supabase/client';
import { hashFileSha256 } from '../../vault/documentHash';
import { validateUploadFile } from '../../vault/vaultStorage';
import { storeMigrationRawFile } from '../../vault/migrationRawStorage';
import { getMigrationPipelineAdapter } from '../migrationPipeline';
import {
  appendBatchFileInCache,
  refreshMigrationBatchCacheFromSupabase,
  upsertMigrationBatchInCache,
} from '../repositories/migrationBatchCache';
import {
  supabaseCreateMigrationBatch,
  supabaseInsertBatchFile,
  supabaseInsertExtractedFacts,
  supabaseInsertLifecycleEvent,
  supabaseUpdateBatchCounts,
  supabaseUpdateBatchFileState,
  supabaseUpdateOrgLifecycle,
} from '../repositories/supabaseMigrationRepository';
import { createMigrationBatch, addFilesToMigrationBatch } from '../../demo/archiveMigrationActions';

export async function createMigrationBatchForOffice(input: {
  organizationId: string;
  staffUserId: string;
}): Promise<{ batchId: string; error?: string }> {
  if (!isSupabaseMode()) {
    const batch = createMigrationBatch(input.organizationId, input.staffUserId);
    return { batchId: batch.id };
  }

  const { batch, error } = await supabaseCreateMigrationBatch({
    organizationId: input.organizationId,
    createdByUserId: input.staffUserId,
  });
  if (error || !batch) return { batchId: '', error: error ?? 'Could not create batch' };

  upsertMigrationBatchInCache(batch);
  await supabaseInsertLifecycleEvent({
    organizationId: input.organizationId,
    toState: 'MIGRATION_IN_PROGRESS',
    eventType: 'MIGRATION_BATCH_CREATED',
    actorType: 'STAFF',
    actorUserId: input.staffUserId,
  });
  await supabaseUpdateOrgLifecycle(input.organizationId, 'MIGRATION_IN_PROGRESS');
  return { batchId: batch.id };
}

export async function uploadFilesToMigrationBatchSupabase(
  batchId: string,
  organizationId: string,
  files: File[],
): Promise<{ added: number; errors: string[]; duplicates: string[] }> {
  const errors: string[] = [];
  const duplicates: string[] = [];
  let added = 0;

  for (const file of files) {
    const validationError = validateUploadFile(file);
    if (validationError) {
      errors.push(`${file.name}: ${validationError}`);
      continue;
    }

    const fileHash = await hashFileSha256(file);

    const sb = getAioSupabase();
    const { data: dupeRows } = sb
      ? await sb
          .from('aio_archive_migration_batch_files')
          .select('id')
          .eq('batch_id', batchId)
          .eq('file_hash', fileHash)
          .limit(1)
      : { data: [] as { id: string }[] };
    if (dupeRows?.length) {
      duplicates.push(`${file.name} — duplicate hash in batch`);
      continue;
    }

    const stored = await storeMigrationRawFile({
      organizationId,
      batchId,
      file,
    });
    if (stored.error || !stored.storagePath) {
      errors.push(`${file.name}: ${stored.error ?? 'Upload failed'}`);
      continue;
    }

    const { file: row, error } = await supabaseInsertBatchFile({
      batchId,
      organizationId,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      fileSizeBytes: file.size,
      fileHash,
      storageReference: stored.storagePath,
      processingState: 'processing',
    });
    if (error || !row) {
      errors.push(`${file.name}: ${error ?? 'Could not record file'}`);
      continue;
    }

    appendBatchFileInCache(row);
    await supabaseUpdateBatchFileState(row.id, {
      queueState: 'UPLOADED',
      processingStage: 'HASH',
      processingState: 'processing',
    });
    await supabaseUpdateBatchFileState(row.id, { processingStage: 'DUPLICATE_CHECK' });

    const pipeline = getMigrationPipelineAdapter();
    await supabaseUpdateBatchFileState(row.id, { queueState: 'PROCESSING', processingStage: 'CLASSIFICATION' });
    const pipelineResult = await pipeline.processFile(
      {
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        sha256: fileHash,
        documentId: row.id,
        storageReference: stored.storagePath,
      },
      { organizationId, batchId },
    );

    if (pipelineResult.exception === 'PROVIDER_UNAVAILABLE') {
      await supabaseUpdateBatchFileState(row.id, {
        queueState: 'FAILED',
        processingStage: 'FIELD_EXTRACTION',
        processingError: 'PROVIDER_UNAVAILABLE',
        processingState: 'failed',
      });
      errors.push(`${file.name}: extraction provider unavailable`);
      continue;
    }
    if (pipelineResult.exception === 'UNSUPPORTED_DOCUMENT') {
      await supabaseUpdateBatchFileState(row.id, {
        queueState: 'UNSUPPORTED',
        processingError: 'UNSUPPORTED_DOCUMENT',
        processingState: 'failed',
      });
      errors.push(`${file.name}: unsupported document type`);
      continue;
    }

    await supabaseUpdateBatchFileState(row.id, { processingStage: 'FIELD_EXTRACTION' });
    await supabaseInsertExtractedFacts(
      pipelineResult.proposedFacts.map((f) => ({
        batchId,
        organizationId,
        entityType: f.entityType,
        fieldKey: f.fieldKey,
        proposedValue: f.proposedValue,
        existingValue: f.existingValue,
        confidence: f.confidence,
        sourceReference: f.sourceReference,
      })),
    );

    await supabaseUpdateBatchCounts(batchId, {
      state: pipelineResult.exception ? 'needs_attention' : 'ready_for_review',
      reviewState: 'pending',
      fileCount: added + 1,
      documentCount: added + 1,
    });

    await supabaseInsertLifecycleEvent({
      organizationId,
      toState: 'MIGRATION_REVIEW_REQUIRED',
      eventType: pipelineResult.exception ? 'DOCUMENT_CLASSIFIED' : 'FACT_EXTRACTED',
      actorType: 'SYSTEM',
      metadata: { batchId, exception: pipelineResult.exception ?? null },
    });
    await supabaseUpdateOrgLifecycle(organizationId, 'MIGRATION_REVIEW_REQUIRED');
    await supabaseUpdateBatchFileState(row.id, {
      queueState: 'READY_FOR_REVIEW',
      processingStage: 'READY_FOR_REVIEW',
      processingState: 'ready',
    });

    added += 1;
  }

  await refreshMigrationBatchCacheFromSupabase();
  return { added, errors, duplicates };
}

/** Unified upload entry — demo store or Supabase production tables + storage. */
export async function uploadFilesToMigrationBatch(
  batchId: string,
  files: File[],
  organizationId?: string,
): Promise<{ added: number; errors: string[]; duplicates: string[] }> {
  if (!isSupabaseMode()) {
    return addFilesToMigrationBatch(batchId, files);
  }
  if (!organizationId) {
    return { added: 0, errors: ['Organization required for Supabase migration upload'], duplicates: [] };
  }
  return uploadFilesToMigrationBatchSupabase(batchId, organizationId, files);
}
