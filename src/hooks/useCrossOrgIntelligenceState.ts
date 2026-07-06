import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_CROSS_ORG_INTELLIGENCE_UPDATED,
  getOrganizationCrossOrgIntelligenceProfile,
  syncCrossOrgIntelligenceFromSources,
  type OrganizationCrossOrgIntelligenceProfile,
} from '../studio-os-core/cross-organization-intelligence';

export function useCrossOrgIntelligenceState() {
  return useStudioProfileState<OrganizationCrossOrgIntelligenceProfile>({
    getProfile: getOrganizationCrossOrgIntelligenceProfile,
    syncProfile: syncCrossOrgIntelligenceFromSources,
    updatedEvent: STUDIO_OS_CROSS_ORG_INTELLIGENCE_UPDATED,
  });
}
