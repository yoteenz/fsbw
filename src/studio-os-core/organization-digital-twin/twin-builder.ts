import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { getOrganizationShadowModeProfile } from '../shadow-mode/store';
import { getOrganizationWisdomProfile } from '../wisdom-capture/store';
import { resolveDigitalExecutiveRoster } from '../executive-council/digital-executives';
import type { OrganizationDigitalTwinProfile, TwinDepartmentSnapshot, TwinOrganizationSnapshot } from './types';

const DEFAULT_DEPARTMENTS = [
  'Operations',
  'Marketing',
  'Finance',
  'Customer Experience',
  'Production',
  'Leadership',
];

function buildDepartmentSnapshots(organizationId: string): TwinDepartmentSnapshot[] {
  const health = getOrganizationHealthIndexProfile(organizationId);
  const pulse = getOrganizationPulseProfile(organizationId);
  const shadow = getOrganizationShadowModeProfile(organizationId);
  const roster = resolveDigitalExecutiveRoster(organizationId);

  const deptNames =
    roster.length > 0
      ? [...new Set(roster.map((e) => e.department))]
      : DEFAULT_DEPARTMENTS;

  return deptNames.map((name, index) => {
    const healthCat = health?.categoryScores.find((c) =>
      c.label.toLowerCase().includes(name.toLowerCase().split(' ')[0])
    );
    const digitalStaff = shadow?.conciergeProfiles.filter((c) =>
      c.department.toLowerCase().includes(name.toLowerCase().split(' ')[0])
    ).length ?? Math.max(1, 2 - (index % 2));

    return {
      id: `dept-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      headcount: Math.max(2, 4 + index * 2),
      digitalStaffCount: digitalStaff,
      healthScore: healthCat?.scorePct ?? 65 + (index * 3) % 25,
      pulseScore: pulse?.indicatorScores[index % (pulse.indicatorScores.length || 1)]?.scorePct ?? 70,
    };
  });
}

export function buildTwinOrganizationSnapshot(organizationId: string): TwinOrganizationSnapshot {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const health = getOrganizationHealthIndexProfile(organizationId);
  const pulse = getOrganizationPulseProfile(organizationId);
  const memory = getOrganizationMemoryProfile(organizationId);
  const wisdom = getOrganizationWisdomProfile(organizationId);
  const shadow = getOrganizationShadowModeProfile(organizationId);
  const departments = buildDepartmentSnapshots(organizationId);

  const totalHeadcount = departments.reduce((s, d) => s + d.headcount, 0);
  const digitalStaffCount =
    shadow?.conciergeProfiles.length ??
    departments.reduce((s, d) => s + d.digitalStaffCount, 0);

  return {
    capturedAt: new Date().toISOString(),
    departmentCount: departments.length,
    totalHeadcount,
    digitalStaffCount,
    executiveHealthScore: health?.executiveHealthScore ?? 72,
    pulseScore: pulse?.overallPulseScore ?? 74,
    pulseState: pulse?.pulseState ?? 'stable',
    memoryEntries: memory?.records.length ?? brain?.brains.reduce((s, b) => s + b.knowledgeEntries.length, 0) ?? 0,
    wisdomEntries: wisdom?.wisdomLibrary.length ?? 0,
    departments,
  };
}

export function computeTwinFidelityScore(organizationId: string, snapshot: TwinOrganizationSnapshot): number {
  let score = 40;
  if (getOrganizationProfessionBrainProfile(organizationId)) score += 15;
  if (getOrganizationHealthIndexProfile(organizationId)) score += 10;
  if (getOrganizationPulseProfile(organizationId)) score += 10;
  if (snapshot.memoryEntries > 5) score += 8;
  if (snapshot.wisdomEntries > 3) score += 7;
  if (snapshot.departments.length >= 4) score += 10;
  return Math.min(98, score);
}

export function buildOrganizationDigitalTwinProfile(
  organizationId: string,
  existing?: OrganizationDigitalTwinProfile | null
): OrganizationDigitalTwinProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const snapshot = buildTwinOrganizationSnapshot(organizationId);

  return {
    organizationId,
    companyName: brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase(),
    industryId: brain?.industryId ?? resolveIndustryForWorkspace(organizationId),
    updatedAt: new Date().toISOString(),
    twinFidelityScore: computeTwinFidelityScore(organizationId, snapshot),
    snapshot,
    simulationHistory: existing?.simulationHistory ?? [],
    sandboxActive: true,
    syncedSources: [
      'profession-brain',
      'memory-engine',
      'wisdom-capture',
      'company-health-index',
      'organization-pulse',
      'executive-council',
      'shadow-mode',
      'business-discovery-blueprint',
    ],
  };
}
