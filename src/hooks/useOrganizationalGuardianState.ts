import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_ORGANIZATIONAL_GUARDIAN_UPDATED,
  getOrganizationGuardianProfile,
  syncOrganizationalGuardianFromSources,
  type OrganizationGuardianProfile,
} from '../studio-os-core/organizational-guardian';

export function useOrganizationalGuardianState() {
  return useStudioProfileState<OrganizationGuardianProfile>({
    getProfile: getOrganizationGuardianProfile,
    syncProfile: syncOrganizationalGuardianFromSources,
    updatedEvent: STUDIO_OS_ORGANIZATIONAL_GUARDIAN_UPDATED,
  });
}
