import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_ORGANIZATION_GENOME_UPDATED,
  getOrganizationGenomeProfile,
  syncOrganizationGenomeFromSources,
  type OrganizationGenomeProfile,
} from '../studio-os-core/organization-genome';

export function useOrganizationGenomeState() {
  return useStudioProfileState<OrganizationGenomeProfile>({
    getProfile: getOrganizationGenomeProfile,
    syncProfile: syncOrganizationGenomeFromSources,
    updatedEvent: STUDIO_OS_ORGANIZATION_GENOME_UPDATED,
  });
}
