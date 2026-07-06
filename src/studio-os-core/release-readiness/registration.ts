import { getOrganizationReleaseReadinessProfile } from './store';

export function isReleaseReadinessActive(organizationId: string): boolean {
  return getOrganizationReleaseReadinessProfile(organizationId) !== null;
}

export function isProductionReady(organizationId: string): boolean {
  return getOrganizationReleaseReadinessProfile(organizationId)?.releaseGate === 'production-ready';
}
