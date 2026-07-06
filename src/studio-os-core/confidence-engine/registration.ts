import { getOrganizationConfidenceEngineProfile } from './store';

export function hasVisibleConfidence(organizationId: string): boolean {
  return (getOrganizationConfidenceEngineProfile(organizationId)?.recommendationsActive ?? 0) > 0;
}

export function hasLowConfidenceRecommendations(organizationId: string): boolean {
  return (getOrganizationConfidenceEngineProfile(organizationId)?.lowConfidenceCount ?? 0) > 0;
}
