import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_DOCUMENTATION_GOVERNANCE_UPDATED,
  getOrganizationDocumentationGovernanceProfile,
  syncDocumentationGovernanceFromSources,
  type OrganizationDocumentationGovernanceProfile,
} from '../studio-os-core/documentation-governance';

export function useDocumentationGovernanceState() {
  return useStudioProfileState<OrganizationDocumentationGovernanceProfile>({
    getProfile: getOrganizationDocumentationGovernanceProfile,
    syncProfile: syncDocumentationGovernanceFromSources,
    updatedEvent: STUDIO_OS_DOCUMENTATION_GOVERNANCE_UPDATED,
  });
}
