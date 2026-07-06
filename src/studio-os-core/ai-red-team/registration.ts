import { getOrganizationAiRedTeamProfile } from './store';

export function canRedTeamRun(organizationId: string): boolean {
  return getOrganizationAiRedTeamProfile(organizationId)?.assumeWrongUntilProven ?? false;
}

export function hasCriticalRedTeamFindings(organizationId: string): boolean {
  return (getOrganizationAiRedTeamProfile(organizationId)?.criticalFindings ?? 0) > 0;
}
