import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  buildDigitalPayrollSummary,
  formatHeadquartersLicenseLabel,
  formatPermanentPurchasePrice,
  getDepartmentPackPricing,
  getPrimaryGrowthRecommendation,
  getStaffStatus,
  listDigitalStaffCatalog,
  listGrowthRecommendations,
  listStaffForOwnedPack,
  listUnlockedStaffIds,
  setDigitalStaffStatus,
  syncMonetizationFromArchitecture,
  type DigitalStaffStatus,
  type OrganizationMonetizationProfile,
} from '../studio-os-core/monetization-architecture';
import { ensureOrganizationArchitectureProfile } from '../studio-os-core/industry-architecture';

export function useMonetizationArchitectureState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationMonetizationProfile | null>(null);

  const refresh = useCallback(() => {
    const arch = ensureOrganizationArchitectureProfile(workspaceId);
    const monetization = syncMonetizationFromArchitecture(
      workspaceId,
      arch.installedPacks.map((p) => p.packId)
    );
    setProfile(monetization);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onExpanded = () => refresh();
    window.addEventListener('studio-os-headquarters-expanded', onExpanded);
    return () => window.removeEventListener('studio-os-headquarters-expanded', onExpanded);
  }, [refresh]);

  const payroll = useMemo(
    () => (profile ? buildDigitalPayrollSummary(profile) : null),
    [profile]
  );

  const growthRecommendations = useMemo(
    () => (profile ? listGrowthRecommendations(profile) : []),
    [profile]
  );

  const primaryGrowth = useMemo(
    () => (profile ? getPrimaryGrowthRecommendation(profile) : null),
    [profile]
  );

  const unlockedStaffIds = useMemo(
    () => (profile ? new Set(listUnlockedStaffIds(profile)) : new Set<string>()),
    [profile]
  );

  const staffRoster = useMemo(() => {
    if (!profile) return [];
    return listDigitalStaffCatalog()
      .filter((s) => unlockedStaffIds.has(s.id))
      .map((staff) => ({
        staff,
        status: getStaffStatus(profile, staff.id),
      }));
  }, [profile, unlockedStaffIds]);

  const toggleStaff = useCallback(
    (staffId: string, status: DigitalStaffStatus) => {
      const next = setDigitalStaffStatus(workspaceId, staffId, status);
      setProfile(next);
    },
    [workspaceId]
  );

  const packPriceLabel = useCallback((packId: string) => formatPermanentPurchasePrice(packId), []);

  const packPricing = useCallback((packId: string) => getDepartmentPackPricing(packId), []);

  const staffForPack = useCallback(
    (packId: string) => (profile ? listStaffForOwnedPack(profile, packId) : []),
    [profile]
  );

  const headquartersLabel = useMemo(
    () => (profile ? formatHeadquartersLicenseLabel(profile.headquartersLicense) : ''),
    [profile]
  );

  return {
    profile,
    payroll,
    growthRecommendations,
    primaryGrowth,
    staffRoster,
    headquartersLabel,
    refresh,
    toggleStaff,
    packPriceLabel,
    packPricing,
    staffForPack,
  };
}
