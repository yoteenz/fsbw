import {useCallback, useMemo, useState} from 'react';
import { buildEcosystemMarketplaceSeed } from '../studio-os-core/ecosystem-marketplace/bootstrap';
import {
  bootstrapEcosystemMarketplaceStore,
  readEcosystemMarketplaceStore,
  selectEcosystemMarketplaceAsset,
  selectEcosystemMarketplaceWorkspace,
} from '../studio-os-core/ecosystem-marketplace/store';
import type { EcosystemMarketplaceWorkspaceId } from '../studio-os-core/ecosystem-marketplace/types';

function ensureSeeded(): void {
  bootstrapEcosystemMarketplaceStore(buildEcosystemMarketplaceSeed());
}

export function useEcosystemMarketplaceState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readEcosystemMarketplaceStore();
  }, [version]);

  const selectedAsset = useMemo(
    () => store.assets.find((a) => a.id === store.selectedAssetId) ?? store.assets[0] ?? null,
    [store.assets, store.selectedAssetId]
  );

  const workspaceAssets = useMemo(
    () => store.assets.filter((a) => a.workspaceId === store.activeWorkspaceId || a.featured),
    [store.assets, store.activeWorkspaceId]
  );

  const assetInheritance = useMemo(
    () => (selectedAsset ? store.inheritanceIntegrations.find((i) => i.assetId === selectedAsset.id) ?? null : null),
    [store.inheritanceIntegrations, selectedAsset]
  );

  const assetSimulation = useMemo(
    () => (selectedAsset ? store.compatibilitySimulations.find((s) => s.assetId === selectedAsset.id) ?? null : null),
    [store.compatibilitySimulations, selectedAsset]
  );

  const assetEvolution = useMemo(
    () => (selectedAsset ? store.assetEvolutions.find((e) => e.assetId === selectedAsset.id) ?? null : null),
    [store.assetEvolutions, selectedAsset]
  );

  const selectWorkspace = useCallback((id: EcosystemMarketplaceWorkspaceId) => {
    selectEcosystemMarketplaceWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const selectAsset = useCallback((id: string | null) => {
    selectEcosystemMarketplaceAsset(id);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    selectedAsset,
    workspaceAssets,
    assetInheritance,
    assetSimulation,
    assetEvolution,
    selectWorkspace,
    selectAsset,
  };
}
