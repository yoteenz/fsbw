import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_EXPERIENCE_QA_UPDATED,
  getOrganizationExperienceQaProfile,
  syncExperienceQaFromSources,
  type OrganizationExperienceQaProfile,
} from '../studio-os-core/experience-qa';

export function useExperienceQaState() {
  return useStudioProfileState<OrganizationExperienceQaProfile>({
    getProfile: getOrganizationExperienceQaProfile,
    syncProfile: syncExperienceQaFromSources,
    updatedEvent: STUDIO_OS_EXPERIENCE_QA_UPDATED,
  });
}
