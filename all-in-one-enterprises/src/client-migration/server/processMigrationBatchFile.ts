import type { SupabaseClient } from '@supabase/supabase-js';
import type { MigrationPipelineResult } from '../migrationPipeline/types';
import { runContentExtractionOnInput } from '../migrationPipeline/runContentExtraction';
import { getAioSupabaseAdmin } from './aioSupabaseAdmin';

const TERMINAL_QUEUE = new Set(['READY_FOR_REVIEW', 'COMPLETED', 'UNSUPPORTED']);

export type ProcessBatchFileInput = {
  batchFileId: string;
  batchId: string;
  organizationId: string;
  force?: boolean;
};

export type ProcessBatchFileResult =
  | { ok: true; skipped?: boolean; pipeline: MigrationPipelineResult }
  | { ok: false; error: string; stage?: string };

export async function processMigrationBatchFile(input: ProcessBatchFileInput): Promise<ProcessBatchFileResult> {
  const admin = getAioSupabaseAdmin();
  if (!admin) return { ok: false, error: 'Server Supabase admin not configured', stage: 'CONFIG' };

  const { data: fileRow, error: fileError } = await admin
    .from('aio_archive_migration_batch_files')
    .select('*')
    .eq('id', input.batchFileId)
    .maybeSingle();
  if (fileError || !fileRow) return { ok: false, error: 'Batch file not found', stage: 'LOAD' };

  if (String(fileRow.batch_id) !== input.batchId) {
    return { ok: false, error: 'Batch file does not belong to batch', stage: 'VALIDATION' };
  }
  if (String(fileRow.organization_id) !== input.organizationId) {
    return { ok: false, error: 'Organization mismatch', stage: 'VALIDATION' };
  }

  const queueState = String(fileRow.queue_state ?? '');
  if (!input.force && TERMINAL_QUEUE.has(queueState)) {
    return {
      ok: true,
      skipped: true,
      pipeline: {
        stage: 'REVIEW_REQUIRED',
        proposedFacts: [],
      },
    };
  }

  const attempts = Number(fileRow.processing_attempts ?? 0);
  if (attempts >= 5 && !input.force) {
    await patchFile(admin, input.batchFileId, {
      queue_state: 'FAILED',
      processing_error: 'MAX_ATTEMPTS',
      processing_state: 'failed',
    });
    return { ok: false, error: 'Maximum processing attempts exceeded', stage: 'RETRY_LIMIT' };
  }

  const leaseUntil = new Date(Date.now() + 120_000).toISOString();
  const { data: leased } = await admin
    .from('aio_archive_migration_batch_files')
    .update({
      queue_state: 'PROCESSING',
      processing_stage: 'TEXT_EXTRACTION',
      processing_state: 'processing',
      processing_attempts: attempts + 1,
      processing_lease_expires_at: leaseUntil,
      processing_error: null,
      last_processed_at: new Date().toISOString(),
    })
    .eq('id', input.batchFileId)
    .in('queue_state', input.force ? [queueState] : ['UPLOADED', 'QUEUED', 'FAILED', 'PROCESSING'])
    .select('id')
    .maybeSingle();

  if (!leased && !input.force) {
    return { ok: true, skipped: true, pipeline: { stage: 'REVIEW_REQUIRED', proposedFacts: [] } };
  }

  const bytes = await downloadMigrationObject(String(fileRow.storage_reference ?? ''));
  if (!bytes) {
    await patchFile(admin, input.batchFileId, {
      queue_state: 'FAILED',
      processing_stage: 'STORAGE_RETRIEVAL',
      processing_error: 'STORAGE_RETRIEVAL_FAILED',
      processing_state: 'failed',
    });
    return { ok: false, error: 'Could not download file from storage', stage: 'STORAGE' };
  }

  await patchFile(admin, input.batchFileId, { processing_stage: 'OCR' });

  const fileContentBase64 = Buffer.from(bytes).toString('base64');
  const pipelineResult = await runContentExtractionOnInput(
    {
      fileName: String(fileRow.file_name),
      mimeType: String(fileRow.mime_type),
      sizeBytes: Number(fileRow.file_size_bytes ?? bytes.length),
      sha256: String(fileRow.file_hash ?? ''),
      documentId: input.batchFileId,
      storageReference: String(fileRow.storage_reference),
      fileContentBase64,
    },
    { organizationId: input.organizationId, batchId: input.batchId },
  );

  if (pipelineResult.exception === 'UNSUPPORTED_DOCUMENT') {
    await patchFile(admin, input.batchFileId, {
      queue_state: 'UNSUPPORTED',
      processing_error: 'UNSUPPORTED_DOCUMENT',
      processing_state: 'failed',
      processing_stage: 'CLASSIFICATION',
    });
    return { ok: false, error: 'Unsupported document', stage: 'UNSUPPORTED' };
  }

  if (
    pipelineResult.exception === 'PROCESSING_FAILED' ||
    pipelineResult.exception === 'PROVIDER_UNAVAILABLE' ||
    pipelineResult.exception === 'UNREADABLE_DOCUMENT'
  ) {
    await patchFile(admin, input.batchFileId, {
      queue_state: 'FAILED',
      processing_error: pipelineResult.exception,
      processing_state: 'failed',
      processing_stage: 'FIELD_EXTRACTION',
    });
    return { ok: false, error: pipelineResult.exception, stage: 'EXTRACTION' };
  }

  await patchFile(admin, input.batchFileId, { processing_stage: 'FACT_EXTRACTION' });

  await admin
    .from('aio_client_extracted_facts')
    .delete()
    .eq('batch_id', input.batchId)
    .like('source_reference', `%document:${input.batchFileId}#%`);

  if (pipelineResult.proposedFacts.length > 0) {
    await admin.from('aio_client_extracted_facts').insert(
      pipelineResult.proposedFacts.map((f) => ({
        batch_id: input.batchId,
        organization_id: input.organizationId,
        document_id: null,
        entity_type: f.entityType,
        field_key: f.fieldKey,
        proposed_value: f.proposedValue ?? null,
        existing_value: f.existingValue ?? null,
        confidence: f.confidence,
        source_reference: f.sourceReference ?? null,
      })),
    );
  }

  const needsAttention = Boolean(pipelineResult.exception) || pipelineResult.proposedFacts.length === 0;
  await admin
    .from('aio_archive_migration_batches')
    .update({
      state: needsAttention ? 'needs_attention' : 'ready_for_review',
      review_state: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.batchId);

  await admin.from('aio_client_lifecycle_events').insert({
    organization_id: input.organizationId,
    to_state: 'MIGRATION_REVIEW_REQUIRED',
    event_type: pipelineResult.proposedFacts.length ? 'FACT_EXTRACTED' : 'DOCUMENT_CLASSIFIED',
    actor_type: 'SYSTEM',
    metadata: { batchId: input.batchId, batchFileId: input.batchFileId, exception: pipelineResult.exception ?? null },
  });

  await admin.from('aio_organizations').update({ client_lifecycle: 'MIGRATION_REVIEW_REQUIRED' }).eq('id', input.organizationId);

  await patchFile(admin, input.batchFileId, {
    queue_state: needsAttention ? 'NEEDS_ATTENTION' : 'READY_FOR_REVIEW',
    processing_stage: 'READY_FOR_REVIEW',
    processing_state: needsAttention ? 'failed' : 'ready',
    processing_error: pipelineResult.exception ?? null,
    processing_lease_expires_at: null,
  });

  return { ok: true, pipeline: pipelineResult };
}

async function patchFile(admin: SupabaseClient, fileId: string, patch: Record<string, unknown>): Promise<void> {
  await admin
    .from('aio_archive_migration_batch_files')
    .update({ ...patch, last_processed_at: new Date().toISOString() })
    .eq('id', fileId);
}

async function downloadMigrationObject(storageReference: string): Promise<Uint8Array | null> {
  const admin = getAioSupabaseAdmin();
  if (!admin || !storageReference) return null;
  const slash = storageReference.indexOf('/');
  if (slash <= 0) return null;
  const bucket = storageReference.slice(0, slash);
  const path = storageReference.slice(slash + 1);
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) return null;
  return new Uint8Array(await data.arrayBuffer());
}
