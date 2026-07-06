import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_PREDICTIVE_ORGANIZATION_UPDATED,
  getOrganizationPredictiveProfile,
  syncPredictiveOrganizationFromSources,
  type OrganizationPredictiveProfile,
} from '../studio-os-core/predictive-organization';

export function usePredictiveOrganizationState() {
  return useStudioProfileState<OrganizationPredictiveProfile>({
    getProfile: getOrganizationPredictiveProfile,
    syncProfile: syncPredictiveOrganizationFromSources,
    updatedEvent: STUDIO_OS_PREDICTIVE_ORGANIZATION_UPDATED,
  });
}
