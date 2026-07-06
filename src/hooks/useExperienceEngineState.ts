import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_EXPERIENCE_ENGINE_UPDATED,
  getOrganizationExperienceEngineProfile,
  syncExperienceEngineFromSources,
  type OrganizationExperienceEngineProfile,
} from '../studio-os-core/experience-engine';

export function useExperienceEngineState() {
  return useStudioProfileState<OrganizationExperienceEngineProfile>({
    getProfile: getOrganizationExperienceEngineProfile,
    syncProfile: syncExperienceEngineFromSources,
    updatedEvent: STUDIO_OS_EXPERIENCE_ENGINE_UPDATED,
  });
}
