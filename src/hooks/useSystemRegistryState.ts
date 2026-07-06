import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_SYSTEM_REGISTRY_UPDATED,
  getOrganizationSystemRegistryProfile,
  syncSystemRegistryFromSources,
  type OrganizationSystemRegistryProfile,
} from '../studio-os-core/system-registry';

export function useSystemRegistryState() {
  return useStudioProfileState<OrganizationSystemRegistryProfile>({
    getProfile: getOrganizationSystemRegistryProfile,
    syncProfile: syncSystemRegistryFromSources,
    updatedEvent: STUDIO_OS_SYSTEM_REGISTRY_UPDATED,
  });
}
