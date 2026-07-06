import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_PREDICTIVE_QA_UPDATED,
  getOrganizationPredictiveQaProfile,
  syncPredictiveQaFromSources,
  type OrganizationPredictiveQaProfile,
} from '../studio-os-core/predictive-qa';

export function usePredictiveQaState() {
  return useStudioProfileState<OrganizationPredictiveQaProfile>({
    getProfile: getOrganizationPredictiveQaProfile,
    syncProfile: syncPredictiveQaFromSources,
    updatedEvent: STUDIO_OS_PREDICTIVE_QA_UPDATED,
  });
}
