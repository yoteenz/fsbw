import { getOrganizationGuardianProfile } from './store';

export function isGuardianActive(organizationId: string): boolean {
  return getOrganizationGuardianProfile(organizationId) !== null;
}

export function hasGuardianAlerts(organizationId: string): boolean {
  return (getOrganizationGuardianProfile(organizationId)?.activeAlerts ?? 0) > 0;
}
