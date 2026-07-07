import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_PROFESSIONAL_PROFILE_UPDATED,
  getOrganizationProfessionalProfilesProfile,
  syncProfessionalProfileFromSources,
  type OrganizationProfessionalProfilesProfile,
} from '../studio-os-core/professional-profile';

export function useProfessionalProfileState() {
  return useStudioProfileState<OrganizationProfessionalProfilesProfile>({
    getProfile: getOrganizationProfessionalProfilesProfile,
    syncProfile: syncProfessionalProfileFromSources,
    updatedEvent: STUDIO_OS_PROFESSIONAL_PROFILE_UPDATED,
  });
}
