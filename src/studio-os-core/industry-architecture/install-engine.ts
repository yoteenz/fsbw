import { UNIVERSAL_MARKETING_PACK_ID } from './constants';
import { getIndustryDefinition, resolveIndustryForWorkspace } from './industries';
import { getPackDefinition, listRecommendedExpansionPacks, listStarterPacksForIndustry } from './pack-registry';
import type {
  ConciergeSpecialist,
  ExpansionInstallPlan,
  HeadquartersDepartment,
  IndustryId,
  OrganizationArchitectureProfile,
} from './types';

const MISSION_CONTROL_DEPARTMENT: HeadquartersDepartment = {
  id: 'mission-control',
  label: 'MISSION CONTROL',
  description: 'Executive headquarters · today\'s briefing · approvals · quick actions',
  moduleId: 'mission-control',
  icon: '🏛️',
  kpiLabel: 'HQ HEALTH',
  kpiValue: '—',
};

function dedupeDepartments(departments: HeadquartersDepartment[]): HeadquartersDepartment[] {
  const seen = new Set<string>();
  return departments.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
}

function dedupeConcierges(concierges: ConciergeSpecialist[]): ConciergeSpecialist[] {
  const seen = new Set<string>();
  return concierges.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

export function buildExpansionInstallPlan(packId: string): ExpansionInstallPlan | null {
  const pack = getPackDefinition(packId);
  if (!pack) return null;
  return {
    packId: pack.id,
    packName: pack.name,
    previewDepartments: pack.outcome.departmentsAdded.map((d) => d.label),
    previewConcierges: pack.outcome.conciergesAdded.map((c) => c.name),
    previewMessage: pack.installPreview,
    expandsHeadquarters: pack.outcome.departmentsAdded.length > 0,
  };
}

export function mergePackIntoProfile(
  profile: OrganizationArchitectureProfile,
  packId: string
): OrganizationArchitectureProfile {
  const pack = getPackDefinition(packId);
  if (!pack) return profile;
  if (profile.installedPacks.some((p) => p.packId === packId)) return profile;

  const installedAt = new Date().toISOString();
  return {
    ...profile,
    installedPacks: [
      ...profile.installedPacks,
      { packId, installedAt, version: '1.0.0' },
    ],
    headquartersDepartments: dedupeDepartments([
      ...profile.headquartersDepartments,
      ...pack.outcome.departmentsAdded,
    ]),
    conciergeRoster: dedupeConcierges([...profile.conciergeRoster, ...pack.outcome.conciergesAdded]),
    commandDockShortcuts: [...new Set([...profile.commandDockShortcuts, ...pack.outcome.commandDockCapabilities])],
    recommendedExpansionPackIds: profile.recommendedExpansionPackIds.filter((id) => id !== packId),
    updatedAt: installedAt,
  };
}

export function buildInitialOrganizationProfile(
  organizationId: string,
  industryId?: IndustryId
): OrganizationArchitectureProfile {
  const resolvedIndustry = industryId ?? resolveIndustryForWorkspace(organizationId);
  const industry = getIndustryDefinition(resolvedIndustry);
  const starterPacks = listStarterPacksForIndustry(resolvedIndustry);
  const marketingPack = getPackDefinition(UNIVERSAL_MARKETING_PACK_ID);
  const packIds = [
    ...starterPacks.map((p) => p.id),
    ...(marketingPack && !starterPacks.some((p) => p.id === UNIVERSAL_MARKETING_PACK_ID) ? [UNIVERSAL_MARKETING_PACK_ID] : []),
  ];

  let profile: OrganizationArchitectureProfile = {
    organizationId,
    industryId: resolvedIndustry,
    installedPacks: [],
    headquartersDepartments: [MISSION_CONTROL_DEPARTMENT],
    conciergeRoster: [],
    marketingInsight: industry?.marketingInsightExample ?? 'Marketing adapts automatically to your industry signals.',
    recommendedExpansionPackIds: listRecommendedExpansionPacks(resolvedIndustry).map((p) => p.id),
    commandDockShortcuts: ['strategy', 'campaigns'],
    onboardingComplete: false,
    updatedAt: new Date().toISOString(),
  };

  for (const packId of packIds) {
    profile = mergePackIntoProfile(profile, packId);
  }

  return { ...profile, onboardingComplete: true };
}

export function buildHeadquartersLayout(profile: OrganizationArchitectureProfile): HeadquartersDepartment[] {
  const mission = profile.headquartersDepartments.find((d) => d.id === 'mission-control') ?? MISSION_CONTROL_DEPARTMENT;
  const rest = profile.headquartersDepartments.filter((d) => d.id !== 'mission-control');
  const marketing = rest.filter((d) => d.id === 'marketing' || d.label === 'MARKETING');
  const others = rest.filter((d) => d.id !== 'marketing' && d.label !== 'MARKETING');
  return [mission, ...others, ...marketing];
}

export function installPackOnProfile(
  profile: OrganizationArchitectureProfile,
  packId: string
): OrganizationArchitectureProfile {
  return mergePackIntoProfile(profile, packId);
}
