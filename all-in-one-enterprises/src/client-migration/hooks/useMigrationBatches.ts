import { useEffect, useState } from 'react';
import { isSupabaseMode } from '../../config/dataMode';
import { loadDemoStore } from '../../demo/demoStore';
import type { ArchiveMigrationBatch, ArchiveMigrationBatchFile } from '../../vault/archiveMigrationTypes';
import {
  getMigrationBatchCache,
  getMigrationBatchFilesCache,
  refreshMigrationBatchCacheFromSupabase,
  refreshBatchFilesCache,
  subscribeMigrationBatchCache,
} from '../repositories/migrationBatchCache';

export function useMigrationBatches(): ArchiveMigrationBatch[] {
  const [rows, setRows] = useState<ArchiveMigrationBatch[]>(() =>
    isSupabaseMode() ? getMigrationBatchCache() : loadDemoStore().archiveMigrationBatches ?? [],
  );

  useEffect(() => {
    if (!isSupabaseMode()) return;
    void refreshMigrationBatchCacheFromSupabase();
    return subscribeMigrationBatchCache(() => setRows([...getMigrationBatchCache()]));
  }, []);

  if (!isSupabaseMode()) {
    return loadDemoStore().archiveMigrationBatches ?? [];
  }
  return rows;
}

export function useMigrationBatchFiles(batchId: string | undefined): ArchiveMigrationBatchFile[] {
  const [files, setFiles] = useState<ArchiveMigrationBatchFile[]>(() =>
    batchId && isSupabaseMode() ? getMigrationBatchFilesCache(batchId) : [],
  );

  useEffect(() => {
    if (!isSupabaseMode() || !batchId) return;
    void refreshBatchFilesCache(batchId).then(() => setFiles([...getMigrationBatchFilesCache(batchId)]));
    return subscribeMigrationBatchCache(() => setFiles([...getMigrationBatchFilesCache(batchId)]));
  }, [batchId]);

  if (!isSupabaseMode() || !batchId) {
    const store = loadDemoStore();
    return (store.archiveMigrationBatchFiles ?? []).filter((f) => f.batchId === batchId);
  }
  return files;
}
