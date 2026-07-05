import { useCallback, useState } from 'react';
import { buildProductionStudioSeed } from '../studio-os-core/production-studio/bootstrap';
import {
  advanceProductionPipelineStage,
  bootstrapProductionStudioStore,
  clearProductionAssetOverride,
  readProductionStudioStore,
  selectProductionStudioJob,
  setProductionAssetOverride,
  setProductionJobQueueStatus,
  setProductionStudioQueueFilter,
} from '../studio-os-core/production-studio/store';
import type { ProductionAssetTypeId, ProductionQueueStatusId } from '../studio-os-core/production-studio/types';

function ensureBootstrap(): void {
  bootstrapProductionStudioStore(buildProductionStudioSeed());
}

export function useProductionStudioState() {
  const [, setTick] = useState(0);
  useState(() => {
    ensureBootstrap();
    return 0;
  });

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  const store = readProductionStudioStore();

  const selectJob = useCallback(
    (jobId: string | null) => {
      selectProductionStudioJob(jobId);
      refresh();
    },
    [refresh]
  );

  const setQueueFilter = useCallback(
    (filter: ProductionQueueStatusId | 'all') => {
      setProductionStudioQueueFilter(filter);
      refresh();
    },
    [refresh]
  );

  const overrideAsset = useCallback(
    (jobId: string, assetType: ProductionAssetTypeId, value: string) => {
      setProductionAssetOverride(jobId, assetType, value);
      refresh();
    },
    [refresh]
  );

  const resetAssetOverride = useCallback(
    (jobId: string, assetType: ProductionAssetTypeId) => {
      clearProductionAssetOverride(jobId, assetType);
      refresh();
    },
    [refresh]
  );

  const advanceStage = useCallback(
    (jobId: string) => {
      advanceProductionPipelineStage(jobId);
      refresh();
    },
    [refresh]
  );

  const setQueueStatus = useCallback(
    (jobId: string, status: ProductionQueueStatusId) => {
      setProductionJobQueueStatus(jobId, status);
      refresh();
    },
    [refresh]
  );

  const selectedJob =
    store.jobs.find((j) => j.id === store.selectedJobId) ?? store.jobs[0] ?? null;

  const filteredJobs =
    store.queueFilter === 'all'
      ? store.jobs
      : store.jobs.filter((j) => j.queueStatus === store.queueFilter);

  return {
    store,
    selectedJob,
    filteredJobs,
    selectJob,
    setQueueFilter,
    overrideAsset,
    resetAssetOverride,
    advanceStage,
    setQueueStatus,
    refresh,
  };
}
