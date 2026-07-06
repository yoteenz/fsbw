import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_COMPONENT_REGISTRY_UPDATED,
  getOrganizationComponentRegistryProfile,
  syncComponentRegistryFromSources,
  type OrganizationComponentRegistryProfile,
} from '../studio-os-core/component-registry';

export function useComponentRegistryState() {
  return useStudioProfileState<OrganizationComponentRegistryProfile>({
    getProfile: getOrganizationComponentRegistryProfile,
    syncProfile: syncComponentRegistryFromSources,
    updatedEvent: STUDIO_OS_COMPONENT_REGISTRY_UPDATED,
  });
}
