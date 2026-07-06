import { getOrganizationSelfHealingEngineProfile } from './store';

export function canSelfHeal(organizationId: string): boolean {
  return getOrganizationSelfHealingEngineProfile(organizationId) !== null;
}

export function hasPendingHealingApprovals(organizationId: string): boolean {
  return (getOrganizationSelfHealingEngineProfile(organizationId)?.pendingApprovals ?? 0) > 0;
}
