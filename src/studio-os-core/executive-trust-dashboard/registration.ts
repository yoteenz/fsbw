import { getOrganizationExecutiveTrustDashboardProfile } from './store';

export function isTrustHealthy(organizationId: string, threshold = 75): boolean {
  const profile = getOrganizationExecutiveTrustDashboardProfile(organizationId);
  return (profile?.overallTrustScore ?? 0) >= threshold;
}

export function getOverallOrganizationalTrust(organizationId: string): number {
  return getOrganizationExecutiveTrustDashboardProfile(organizationId)?.overallTrustScore ?? 0;
}
