import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_STUDIO_FOUNDATION_MODELS_UPDATED,
  getOrganizationStudioFoundationModelsProfile,
  syncStudioFoundationModelsFromSources,
  type OrganizationStudioFoundationModelsProfile,
} from '../studio-os-core/studio-foundation-models';

export function useStudioFoundationModelsState() {
  return useStudioProfileState<OrganizationStudioFoundationModelsProfile>({
    getProfile: getOrganizationStudioFoundationModelsProfile,
    syncProfile: syncStudioFoundationModelsFromSources,
    updatedEvent: STUDIO_OS_STUDIO_FOUNDATION_MODELS_UPDATED,
  });
}
