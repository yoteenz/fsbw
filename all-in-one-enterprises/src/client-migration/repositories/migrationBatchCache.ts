import type { ArchiveMigrationBatch, ArchiveMigrationBatchFile } from '../../vault/archiveMigrationTypes';
import { isSupabaseMode } from '../../config/dataMode';
import { supabaseListMigrationBatches, supabaseListBatchFiles } from './supabaseMigrationRepository';

type Listener = () => void;

let batches: ArchiveMigrationBatch[] = [];
const filesByBatch = new Map<string, ArchiveMigrationBatchFile[]>();
const listeners = new Set<Listener>();

export function subscribeMigrationBatchCache(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  listeners.forEach((l) => l());
}

export function getMigrationBatchCache(): ArchiveMigrationBatch[] {
  return batches;
}

export function getMigrationBatchFilesCache(batchId: string): ArchiveMigrationBatchFile[] {
  return filesByBatch.get(batchId) ?? [];
}

export function setMigrationBatchCache(next: ArchiveMigrationBatch[]): void {
  batches = next;
  notify();
}

export function upsertMigrationBatchInCache(batch: ArchiveMigrationBatch): void {
  const idx = batches.findIndex((b) => b.id === batch.id);
  if (idx >= 0) batches[idx] = batch;
  else batches.unshift(batch);
  notify();
}

export function setBatchFilesInCache(batchId: string, files: ArchiveMigrationBatchFile[]): void {
  filesByBatch.set(batchId, files);
  notify();
}

export function appendBatchFileInCache(file: ArchiveMigrationBatchFile): void {
  const list = filesByBatch.get(file.batchId) ?? [];
  list.push(file);
  filesByBatch.set(file.batchId, list);
  notify();
}

export async function refreshMigrationBatchCacheFromSupabase(): Promise<void> {
  if (!isSupabaseMode()) return;
  const next = await supabaseListMigrationBatches();
  setMigrationBatchCache(next);
}

export async function refreshBatchFilesCache(batchId: string): Promise<void> {
  if (!isSupabaseMode()) return;
  const files = await supabaseListBatchFiles(batchId);
  setBatchFilesInCache(batchId, files);
}
