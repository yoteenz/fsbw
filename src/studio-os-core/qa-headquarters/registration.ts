import { getOrganizationQaHeadquartersProfile } from './store';

export function canQaValidationRun(organizationId: string): boolean {
  const profile = getOrganizationQaHeadquartersProfile(organizationId);
  return profile?.qualityAssuranceActive ?? false;
}

export function isTrustScoreHealthy(organizationId: string, threshold = 75): boolean {
  const profile = getOrganizationQaHeadquartersProfile(organizationId);
  return (profile?.overallTrustScore ?? 0) >= threshold;
}
