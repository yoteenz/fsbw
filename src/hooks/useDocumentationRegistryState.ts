import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_DOCUMENTATION_REGISTRY_UPDATED,
  getOrganizationDocumentationRegistryProfile,
  syncDocumentationRegistryFromSources,
  type OrganizationDocumentationRegistryProfile,
} from '../studio-os-core/documentation-registry';

export function useDocumentationRegistryState() {
  return useStudioProfileState<OrganizationDocumentationRegistryProfile>({
    getProfile: getOrganizationDocumentationRegistryProfile,
    syncProfile: syncDocumentationRegistryFromSources,
    updatedEvent: STUDIO_OS_DOCUMENTATION_REGISTRY_UPDATED,
  });
}
