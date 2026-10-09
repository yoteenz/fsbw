import { isSupabaseMode } from '../../config/dataMode';
import { getAioSupabase } from '../../data/supabase/client';
import { hashFileSha256 } from '../../vault/documentHash';
import { validateUploadFile } from '../../vault/vaultStorage';
import { storeMigrationRawFile } from '../../vault/migrationRawStorage';
import {
  appendBatchFileInCache,
  refreshMigrationBatchCacheFromSupabase,
  refreshBatchFilesCache,
  upsertMigrationBatchInCache,
} from '../repositories/migrationBatchCache';
import { enqueueMigrationBatchFileProcessing } from './migrationFileProcessingEnqueue';
import {
  supabaseCreateMigrationBatch,
  supabaseInsertBatchFile,
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
    await supabaseUpdateBatchFileState(row.id, { processingStage: 'DUPLICATE_CHECK', queueState: 'QUEUED' });

    const enqueue = await enqueueMigrationBatchFileProcessing({
      batchFileId: row.id,
      batchId,
      organizationId,
    });
    if (!enqueue.ok) {
      await supabaseUpdateBatchFileState(row.id, {
        queueState: 'FAILED',
        processingError: enqueue.error ?? 'ENQUEUE_FAILED',
        processingState: 'failed',
      });
      errors.push(`${file.name}: ${enqueue.error ?? 'Could not start server processing'}`);
      continue;
    }

    await supabaseUpdateBatchCounts(batchId, {
      state: 'processing',
      reviewState: 'pending',
      fileCount: added + 1,
      documentCount: added + 1,
    });

    added += 1;
  }

  await refreshMigrationBatchCacheFromSupabase();
  await refreshBatchFilesCache(batchId);
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
