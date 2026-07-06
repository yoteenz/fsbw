import { getOrganizationPredictiveQaProfile } from './store';

export function canPredictFutureRisks(organizationId: string): boolean {
  return (getOrganizationPredictiveQaProfile(organizationId)?.activePredictions ?? 0) > 0;
}

export function hasPreventableRisks(organizationId: string): boolean {
  return (getOrganizationPredictiveQaProfile(organizationId)?.preventableRisks ?? 0) > 0;
}
