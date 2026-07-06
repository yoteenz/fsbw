import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_ORGANIZATION_PULSE_UPDATED,
  getOrganizationPulseProfile,
  syncOrganizationPulseFromSources,
  type OrganizationPulseProfile,
} from '../studio-os-core/organization-pulse';

export function useOrganizationPulseState() {
  return useStudioProfileState<OrganizationPulseProfile>({
    getProfile: getOrganizationPulseProfile,
    syncProfile: syncOrganizationPulseFromSources,
    updatedEvent: STUDIO_OS_ORGANIZATION_PULSE_UPDATED,
  });
}
