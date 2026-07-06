import { canReachProduction } from './engine-profile-builder';
import { getOrganizationQaSimulationEngineProfile } from './store';

export function isProductionGateCleared(organizationId: string): boolean {
  const profile = getOrganizationQaSimulationEngineProfile(organizationId);
  return profile ? canReachProduction(profile) : false;
}

export function canSimulationRun(organizationId: string): boolean {
  const profile = getOrganizationQaSimulationEngineProfile(organizationId);
  return profile?.practiceFieldActive ?? false;
}
