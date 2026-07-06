import { getPackDefinition } from '../industry-architecture/pack-registry';
import { getOrganizationArchitectureProfile } from '../industry-architecture/store';
import {
  getDigitalStaffDefinition,
  listDigitalStaffCatalog,
  resolveStaffIdFromConcierge,
} from './digital-staff-catalog';
import type {
  DigitalPayrollSummary,
  DigitalStaffActivation,
  DigitalStaffStatus,
  OrganizationMonetizationProfile,
} from './types';

function activationMap(profile: OrganizationMonetizationProfile): Map<string, DigitalStaffActivation> {
  return new Map(profile.staffActivations.map((a) => [a.staffId, a]));
}

export function listUnlockedStaffIds(profile: OrganizationMonetizationProfile): string[] {
  const unlocked = new Set<string>();

  for (const staff of listDigitalStaffCatalog()) {
    if (!staff.unlockedByPackId) {
      unlocked.add(staff.id);
      continue;
    }
    if (profile.ownedPackIds.includes(staff.unlockedByPackId)) {
      unlocked.add(staff.id);
    }
  }

  const arch = getOrganizationArchitectureProfile(profile.organizationId);
  if (arch) {
    for (const concierge of arch.conciergeRoster) {
      const staffId = resolveStaffIdFromConcierge(concierge.id);
      if (staffId) unlocked.add(staffId);
    }
  }

  return [...unlocked];
}

export function getStaffStatus(
  profile: OrganizationMonetizationProfile,
  staffId: string
): DigitalStaffStatus {
  const unlocked = listUnlockedStaffIds(profile);
  if (!unlocked.includes(staffId)) return 'available';
  const activation = activationMap(profile).get(staffId);
  return activation?.status ?? 'available';
}

export function buildDigitalPayrollSummary(profile: OrganizationMonetizationProfile): DigitalPayrollSummary {
  const unlocked = listUnlockedStaffIds(profile);
  const activations = activationMap(profile);

  let activeEmployeeCount = 0;
  let pausedEmployeeCount = 0;
  let availableEmployeeCount = 0;
  let monthlyDigitalPayroll = 0;

  for (const staffId of unlocked) {
    const staff = getDigitalStaffDefinition(staffId);
    if (!staff) continue;
    const status = activations.get(staffId)?.status ?? 'available';

    if (status === 'active') {
      activeEmployeeCount += 1;
      if (!staff.includedInHeadquartersLicense) {
        monthlyDigitalPayroll += staff.monthlyPayroll;
      }
    } else if (status === 'paused') {
      pausedEmployeeCount += 1;
    } else {
      availableEmployeeCount += 1;
    }
  }

  const headquartersLicenseMonthly =
    profile.headquartersLicense.status === 'active' ? profile.headquartersLicense.monthlyAmount : 0;

  return {
    activeEmployeeCount,
    availableEmployeeCount,
    pausedEmployeeCount,
    monthlyDigitalPayroll,
    headquartersLicenseMonthly,
    totalMonthlyInvestment: headquartersLicenseMonthly + monthlyDigitalPayroll,
  };
}

export function listStaffForOwnedPack(
  profile: OrganizationMonetizationProfile,
  packId: string
): Array<{ staff: ReturnType<typeof getDigitalStaffDefinition>; status: DigitalStaffStatus }> {
  const pack = getPackDefinition(packId);
  if (!pack) return [];

  const staffIds = new Set<string>();
  for (const concierge of pack.outcome.conciergesAdded) {
    const staffId = resolveStaffIdFromConcierge(concierge.id);
    if (staffId) staffIds.add(staffId);
  }
  for (const staff of listDigitalStaffCatalog()) {
    if (staff.unlockedByPackId === packId) staffIds.add(staff.id);
  }

  return [...staffIds]
    .map((id) => {
      const staff = getDigitalStaffDefinition(id);
      if (!staff) return null;
      return { staff, status: getStaffStatus(profile, id) };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

export function formatMonthlyPayroll(amount: number): string {
  return `$${amount.toLocaleString()}`;
}
