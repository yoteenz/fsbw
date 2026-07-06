import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  discoverExperts,
  ensureOrganizationExpertMarketplaceProfile,
  listPublicExpertCatalog,
  syncExpertMarketplaceFromProfessionBrain,
  type ExpertDiscoveryQuery,
  type OrganizationExpertMarketplaceProfile,
} from '../studio-os-core/expert-marketplace';

export function useExpertMarketplaceState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationExpertMarketplaceProfile | null>(null);
  const [query, setQuery] = useState<ExpertDiscoveryQuery>({});

  const refresh = useCallback(() => {
    const next =
      syncExpertMarketplaceFromProfessionBrain(workspaceId) ??
      ensureOrganizationExpertMarketplaceProfile(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  const publicCatalog = useMemo(() => listPublicExpertCatalog(), [profile]);

  const discoveryResults = useMemo(
    () => discoverExperts(publicCatalog, query),
    [publicCatalog, query]
  );

  return {
    profile,
    publicCatalog,
    discoveryResults,
    query,
    setQuery,
    refresh,
  };
}
