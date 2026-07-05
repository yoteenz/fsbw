import {useCallback, useMemo, useState} from 'react';
import { buildCreatorMarketplaceSeed } from '../studio-os-core/creator-marketplace/bootstrap';
import {
  bootstrapCreatorMarketplaceStore,
  readCreatorMarketplaceStore,
  selectCreatorMarketplaceBrand,
  selectCreatorMarketplaceCreator,
  selectCreatorMarketplaceWorkspace,
} from '../studio-os-core/creator-marketplace/store';
import type { CreatorMarketplaceWorkspaceId } from '../studio-os-core/creator-marketplace/types';

function ensureSeeded(): void {
  bootstrapCreatorMarketplaceStore(buildCreatorMarketplaceSeed());
}

export function useCreatorMarketplaceState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readCreatorMarketplaceStore();
  }, [version]);

  const selectedCreator = useMemo(
    () => store.creators.find((c) => c.id === store.selectedCreatorId) ?? store.creators[0] ?? null,
    [store.creators, store.selectedCreatorId]
  );

  const selectedBrand = useMemo(
    () => store.brands.find((b) => b.id === store.selectedBrandId) ?? store.brands[0] ?? null,
    [store.brands, store.selectedBrandId]
  );

  const workspaceCreators = useMemo(
    () => store.creators.filter((c) => c.workspaceId === store.activeWorkspaceId),
    [store.creators, store.activeWorkspaceId]
  );

  const creatorMatches = useMemo(
    () => (selectedCreator ? store.matches.filter((m) => m.creatorId === selectedCreator.id) : store.matches),
    [store.matches, selectedCreator]
  );

  const creatorDeals = useMemo(
    () => (selectedCreator ? store.deals.filter((d) => d.creatorId === selectedCreator.id) : []),
    [store.deals, selectedCreator]
  );

  const creatorOs = useMemo(
    () => (selectedCreator ? store.creatorOs[selectedCreator.id] ?? null : null),
    [store.creatorOs, selectedCreator]
  );

  const selectWorkspace = useCallback((id: CreatorMarketplaceWorkspaceId) => {
    selectCreatorMarketplaceWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const selectCreator = useCallback((id: string | null) => {
    selectCreatorMarketplaceCreator(id);
    setVersion((v) => v + 1);
  }, []);

  const selectBrand = useCallback((id: string | null) => {
    selectCreatorMarketplaceBrand(id);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    selectedCreator,
    selectedBrand,
    workspaceCreators,
    creatorMatches,
    creatorDeals,
    creatorOs,
    selectWorkspace,
    selectCreator,
    selectBrand,
  };
}
