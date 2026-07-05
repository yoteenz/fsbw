import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildDistributionEngineSeed } from '../studio-os-core/distribution-engine/bootstrap';
import {
  bootstrapDistributionEngineStore,
  readDistributionEngineStore,
  selectDistributionEngineAsset,
  selectDistributionEngineWorkspace,
} from '../studio-os-core/distribution-engine/store';
import type { DistributionWorkspaceId } from '../studio-os-core/distribution-engine/types';

function ensureSeeded(): void {
  bootstrapDistributionEngineStore(buildDistributionEngineSeed());
}

export function useDistributionEngineState() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readDistributionEngineStore();
  }, [version]);

  const selectedAsset = useMemo(
    () => store.knowledgeAssets.find((a) => a.id === store.selectedAssetId) ?? store.knowledgeAssets[0] ?? null,
    [store.knowledgeAssets, store.selectedAssetId]
  );

  const workspaceAssets = useMemo(
    () => store.knowledgeAssets.filter((a) => a.workspaceId === store.activeWorkspaceId),
    [store.knowledgeAssets, store.activeWorkspaceId]
  );

  const assetAdaptations = useMemo(
    () => (selectedAsset ? store.adaptations.filter((a) => a.assetId === selectedAsset.id) : []),
    [store.adaptations, selectedAsset]
  );

  const assetPerformance = useMemo(
    () => (selectedAsset ? store.performance[selectedAsset.id] ?? null : null),
    [store.performance, selectedAsset]
  );

  const selectWorkspace = useCallback((id: DistributionWorkspaceId) => {
    selectDistributionEngineWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const selectAsset = useCallback((id: string | null) => {
    selectDistributionEngineAsset(id);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    selectedAsset,
    workspaceAssets,
    assetAdaptations,
    assetPerformance,
    selectWorkspace,
    selectAsset,
  };
}
