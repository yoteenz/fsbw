import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_SUCCESSION_MODE_UPDATED,
  getOrganizationSuccessionProfile,
  syncSuccessionModeFromSources,
  type OrganizationSuccessionProfile,
} from '../studio-os-core/succession-mode';

export function useSuccessionModeState() {
  return useStudioProfileState<OrganizationSuccessionProfile>({
    getProfile: getOrganizationSuccessionProfile,
    syncProfile: syncSuccessionModeFromSources,
    updatedEvent: STUDIO_OS_SUCCESSION_MODE_UPDATED,
  });
}
