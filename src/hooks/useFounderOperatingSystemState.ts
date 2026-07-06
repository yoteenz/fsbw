import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_FOUNDER_OPERATING_SYSTEM_UPDATED,
  getOrganizationFounderOperatingSystemProfile,
  syncFounderOperatingSystemFromSources,
  type OrganizationFounderOperatingSystemProfile,
} from '../studio-os-core/founder-operating-system';

export function useFounderOperatingSystemState() {
  return useStudioProfileState<OrganizationFounderOperatingSystemProfile>({
    getProfile: getOrganizationFounderOperatingSystemProfile,
    syncProfile: syncFounderOperatingSystemFromSources,
    updatedEvent: STUDIO_OS_FOUNDER_OPERATING_SYSTEM_UPDATED,
  });
}
