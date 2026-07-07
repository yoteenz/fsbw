import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_ORGANIZATIONAL_HIERARCHY_UPDATED,
  getOrganizationHierarchyProfile,
  syncOrganizationalHierarchyFromSources,
  type OrganizationHierarchyProfile,
} from '../studio-os-core/organizational-hierarchy';

export function useOrganizationalHierarchyState() {
  return useStudioProfileState<OrganizationHierarchyProfile>({
    getProfile: getOrganizationHierarchyProfile,
    syncProfile: syncOrganizationalHierarchyFromSources,
    updatedEvent: STUDIO_OS_ORGANIZATIONAL_HIERARCHY_UPDATED,
  });
}
