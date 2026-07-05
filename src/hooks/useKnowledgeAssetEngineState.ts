import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildKnowledgeAssetEngineSeed } from '../studio-os-core/knowledge-asset-engine/bootstrap';
import {
  bootstrapKnowledgeAssetEngineStore,
  readKnowledgeAssetEngineStore,
  selectKnowledgeAsset,
  selectKnowledgeAssetEngineWorkspace,
} from '../studio-os-core/knowledge-asset-engine/store';
import type { KnowledgeAssetWorkspaceId } from '../studio-os-core/knowledge-asset-engine/types';

function ensureSeeded(): void {
  bootstrapKnowledgeAssetEngineStore(buildKnowledgeAssetEngineSeed());
}

export function useKnowledgeAssetEngineState() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readKnowledgeAssetEngineStore();
  }, [version]);

  const selectedAsset = useMemo(
    () => store.assets.find((a) => a.id === store.selectedAssetId) ?? store.assets[0] ?? null,
    [store.assets, store.selectedAssetId]
  );

  const workspaceAssets = useMemo(
    () => store.assets.filter((a) => a.workspaceId === store.activeWorkspaceId),
    [store.assets, store.activeWorkspaceId]
  );

  const assetSsot = useMemo(
    () => (selectedAsset ? store.singleSourceOfTruth.find((s) => s.canonicalAssetId === selectedAsset.id) ?? null : null),
    [store.singleSourceOfTruth, selectedAsset]
  );

  const assetEvolution = useMemo(
    () => (selectedAsset ? store.evolutions.find((e) => e.assetId === selectedAsset.id) ?? null : null),
    [store.evolutions, selectedAsset]
  );

  const assetMaturity = useMemo(
    () => (selectedAsset ? store.maturityMetrics.find((m) => m.assetId === selectedAsset.id) ?? null : null),
    [store.maturityMetrics, selectedAsset]
  );

  const assetLineage = useMemo(
    () => (selectedAsset ? store.lineage.filter((l) => l.assetId === selectedAsset.id) : store.lineage),
    [store.lineage, selectedAsset]
  );

  const assetRelationships = useMemo(
    () => (selectedAsset ? store.relationships.filter((r) => r.assetId === selectedAsset.id) : []),
    [store.relationships, selectedAsset]
  );

  const assetTransformations = useMemo(
    () => (selectedAsset ? store.transformations.filter((t) => t.sourceAssetId === selectedAsset.id) : []),
    [store.transformations, selectedAsset]
  );

  const assetIntelligence = useMemo(
    () => (selectedAsset ? store.intelligenceRecs.filter((r) => r.assetId === selectedAsset.id) : store.intelligenceRecs),
    [store.intelligenceRecs, selectedAsset]
  );

  const assetRevenue = useMemo(
    () => (selectedAsset ? store.revenue[selectedAsset.id] ?? null : null),
    [store.revenue, selectedAsset]
  );

  const selectWorkspace = useCallback((id: KnowledgeAssetWorkspaceId) => {
    selectKnowledgeAssetEngineWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const selectAsset = useCallback((id: string | null) => {
    selectKnowledgeAsset(id);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    selectedAsset,
    workspaceAssets,
    assetSsot,
    assetEvolution,
    assetMaturity,
    assetLineage,
    assetRelationships,
    assetTransformations,
    assetIntelligence,
    assetRevenue,
    selectWorkspace,
    selectAsset,
  };
}
