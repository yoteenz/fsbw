import { getAioSupabase } from '../../data/supabase/client';
import type { ArchiveMigrationBatch, ArchiveMigrationBatchFile } from '../../vault/archiveMigrationTypes';

function mapBatch(row: Record<string, unknown>): ArchiveMigrationBatch {
  const orgId = String(row.organization_id);
  return {
    id: String(row.id),
    organizationId: orgId,
    clientId: orgId,
    createdByStaffId: String(row.created_by_user_id ?? 'staff'),
    state: row.state as ArchiveMigrationBatch['state'],
    reviewState: row.review_state as ArchiveMigrationBatch['reviewState'],
    approvalState: row.approval_state as ArchiveMigrationBatch['approvalState'],
    fileCount: Number(row.file_count ?? 0),
    documentCount: Number(row.document_count ?? 0),
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapBatchFile(row: Record<string, unknown>): ArchiveMigrationBatchFile {
  return {
    id: String(row.id),
    batchId: String(row.batch_id),
    organizationId: String(row.organization_id),
    fileName: String(row.file_name),
    mimeType: String(row.mime_type),
    fileSizeBytes: Number(row.file_size_bytes),
    fileHash: row.file_hash ? String(row.file_hash) : undefined,
    storageReference: row.storage_reference ? String(row.storage_reference) : undefined,
    pageCount: row.page_count != null ? Number(row.page_count) : undefined,
    processingState: row.processing_state as ArchiveMigrationBatchFile['processingState'],
    documentId: row.document_id ? String(row.document_id) : undefined,
    createdAt: String(row.created_at),
    queueState: row.queue_state ? String(row.queue_state) : undefined,
    processingStage: row.processing_stage ? String(row.processing_stage) : undefined,
    processingError: row.processing_error ? String(row.processing_error) : undefined,
  };
}

export async function supabaseListMigrationBatches(): Promise<ArchiveMigrationBatch[]> {
  const supabase = getAioSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('aio_archive_migration_batches')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[migration] list batches failed', error.message);
    return [];
  }
  return (data ?? []).map((row) => mapBatch(row as Record<string, unknown>));
}

export async function supabaseGetMigrationBatch(batchId: string): Promise<ArchiveMigrationBatch | undefined> {
  const supabase = getAioSupabase();
  if (!supabase) return undefined;
  const { data, error } = await supabase
    .from('aio_archive_migration_batches')
    .select('*')
    .eq('id', batchId)
    .maybeSingle();
  if (error || !data) return undefined;
  return mapBatch(data as Record<string, unknown>);
}

export async function supabaseListBatchFiles(batchId: string): Promise<ArchiveMigrationBatchFile[]> {
  const supabase = getAioSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('aio_archive_migration_batch_files')
    .select('*')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return (data ?? []).map((row) => mapBatchFile(row as Record<string, unknown>));
}

export async function supabaseCreateMigrationBatch(input: {
  organizationId: string;
  createdByUserId: string;
}): Promise<{ batch?: ArchiveMigrationBatch; error?: string }> {
  const supabase = getAioSupabase();
  if (!supabase) return { error: 'Backend is not configured.' };

  const { data, error } = await supabase
    .from('aio_archive_migration_batches')
    .insert({
      organization_id: input.organizationId,
      created_by_user_id: input.createdByUserId,
      state: 'uploading',
      review_state: 'pending',
      approval_state: 'pending',
      file_count: 0,
      document_count: 0,
    })
    .select('*')
    .single();

  if (error) return { error: error.message };
  return { batch: mapBatch(data as Record<string, unknown>) };
}

export async function supabaseInsertBatchFile(row: {
  batchId: string;
  organizationId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  fileHash: string;
  storageReference: string;
  processingState: ArchiveMigrationBatchFile['processingState'];
}): Promise<{ file?: ArchiveMigrationBatchFile; error?: string }> {
  const supabase = getAioSupabase();
  if (!supabase) return { error: 'Backend is not configured.' };

  const { data, error } = await supabase
    .from('aio_archive_migration_batch_files')
    .insert({
      batch_id: row.batchId,
      organization_id: row.organizationId,
      file_name: row.fileName,
      mime_type: row.mimeType,
      file_size_bytes: row.fileSizeBytes,
      file_hash: row.fileHash,
      storage_reference: row.storageReference,
      processing_state: row.processingState,
    })
    .select('*')
    .single();

  if (error) return { error: error.message };
  return { file: mapBatchFile(data as Record<string, unknown>) };
}

export async function supabaseUpdateBatchCounts(
  batchId: string,
  patch: Partial<Pick<ArchiveMigrationBatch, 'state' | 'reviewState' | 'fileCount' | 'documentCount'>>,
): Promise<void> {
  const supabase = getAioSupabase();
  if (!supabase) return;
  await supabase
    .from('aio_archive_migration_batches')
    .update({
      state: patch.state,
      review_state: patch.reviewState,
      file_count: patch.fileCount,
      document_count: patch.documentCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', batchId);
}

export async function supabaseInsertExtractedFacts(
  facts: {
    batchId: string;
    organizationId: string;
    documentId?: string;
    entityType: string;
    fieldKey: string;
    proposedValue?: string;
    existingValue?: string;
    confidence: string;
    sourceReference?: string;
  }[],
): Promise<void> {
  const supabase = getAioSupabase();
  if (!supabase || facts.length === 0) return;
  await supabase.from('aio_client_extracted_facts').insert(
    facts.map((f) => ({
      batch_id: f.batchId,
      organization_id: f.organizationId,
      document_id: f.documentId ?? null,
      entity_type: f.entityType,
      field_key: f.fieldKey,
      proposed_value: f.proposedValue ?? null,
      existing_value: f.existingValue ?? null,
      confidence: f.confidence,
      source_reference: f.sourceReference ?? null,
    })),
  );
}

export async function supabaseInsertLifecycleEvent(input: {
  organizationId: string;
  fromState?: string;
  toState: string;
  eventType: string;
  actorType: string;
  actorUserId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getAioSupabase();
  if (!supabase) return;
  await supabase.from('aio_client_lifecycle_events').insert({
    organization_id: input.organizationId,
    from_state: input.fromState ?? null,
    to_state: input.toState,
    event_type: input.eventType,
    actor_type: input.actorType,
    actor_user_id: input.actorUserId ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function supabaseUpdateOrgLifecycle(organizationId: string, lifecycle: string): Promise<void> {
  const supabase = getAioSupabase();
  if (!supabase) return;
  await supabase.from('aio_organizations').update({ client_lifecycle: lifecycle }).eq('id', organizationId);
}

export async function supabaseUpdateBatchFileState(
  fileId: string,
  patch: {
    queueState?: string;
    processingStage?: string;
    processingState?: string;
    processingError?: string | null;
    documentId?: string;
  },
): Promise<void> {
  const supabase = getAioSupabase();
  if (!supabase) return;
  await supabase
    .from('aio_archive_migration_batch_files')
    .update({
      queue_state: patch.queueState,
      processing_stage: patch.processingStage,
      processing_state: patch.processingState,
      processing_error: patch.processingError,
      document_id: patch.documentId,
      last_processed_at: new Date().toISOString(),
    })
    .eq('id', fileId);
}

export async function supabaseListExtractedFacts(batchId: string) {
  const supabase = getAioSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from('aio_client_extracted_facts').select('*').eq('batch_id', batchId);
  return data ?? [];
}

export async function supabaseUpdateExtractedFactReview(
  factId: string,
  reviewAction: string,
): Promise<{ error?: string }> {
  const supabase = getAioSupabase();
  if (!supabase) return { error: 'Backend is not configured.' };
  const { error } = await supabase
    .from('aio_client_extracted_facts')
    .update({ review_action: reviewAction })
    .eq('id', factId);
  return { error: error?.message };
}
