import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  buildExpansionInstallPlan,
  buildHeadquartersLayout,
  ensureOrganizationArchitectureProfile,
  getIndustryDefinition,
  getPackDefinition,
  installDepartmentPack,
  listExpansionPacks,
  listIndustryDefinitions,
  listRecommendedExpansionPacks,
  listStarterPacksForIndustry,
  setOrganizationIndustry,
  type IndustryId,
  type OrganizationArchitectureProfile,
} from '../studio-os-core/industry-architecture';

export function useExpansionCenterState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationArchitectureProfile | null>(null);
  const [installingPackId, setInstallingPackId] = useState<string | null>(null);
  const [lastInstalledPackId, setLastInstalledPackId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setProfile(ensureOrganizationArchitectureProfile(workspaceId));
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onExpanded = (event: Event) => {
      const detail = (event as CustomEvent<{ organizationId: string }>).detail;
      if (detail?.organizationId === workspaceId) refresh();
    };
    window.addEventListener('studio-os-headquarters-expanded', onExpanded);
    return () => window.removeEventListener('studio-os-headquarters-expanded', onExpanded);
  }, [workspaceId, refresh]);

  const industry = useMemo(
    () => (profile ? getIndustryDefinition(profile.industryId) : undefined),
    [profile]
  );

  const headquartersLayout = useMemo(
    () => (profile ? buildHeadquartersLayout(profile) : []),
    [profile]
  );

  const installedPackIds = useMemo(
    () => new Set(profile?.installedPacks.map((p) => p.packId) ?? []),
    [profile]
  );

  const availableExpansionPacks = useMemo(() => {
    if (!profile) return [];
    return listExpansionPacks().filter((p) => !installedPackIds.has(p.id));
  }, [profile, installedPackIds]);

  const recommendedPacks = useMemo(() => {
    if (!profile) return [];
    return listRecommendedExpansionPacks(profile.industryId).filter((p) => !installedPackIds.has(p.id));
  }, [profile, installedPackIds]);

  const starterPacks = useMemo(() => {
    if (!profile) return [];
    return listStarterPacksForIndustry(profile.industryId);
  }, [profile]);

  const installPack = useCallback(
    (packId: string) => {
      setInstallingPackId(packId);
      const next = installDepartmentPack(workspaceId, packId);
      setProfile(next);
      setLastInstalledPackId(packId);
      setInstallingPackId(null);
    },
    [workspaceId]
  );

  const changeIndustry = useCallback(
    (industryId: IndustryId) => {
      const next = setOrganizationIndustry(workspaceId, industryId);
      setProfile(next);
    },
    [workspaceId]
  );

  const previewPlan = useCallback((packId: string) => buildExpansionInstallPlan(packId), []);

  const getInstalledPack = useCallback(
    (packId: string) => getPackDefinition(packId),
    []
  );

  return {
    workspaceId,
    profile,
    industry,
    industries: listIndustryDefinitions(),
    headquartersLayout,
    installedPackIds,
    starterPacks,
    availableExpansionPacks,
    recommendedPacks,
    installingPackId,
    lastInstalledPackId,
    installPack,
    changeIndustry,
    previewPlan,
    getInstalledPack,
    refresh,
  };
}
