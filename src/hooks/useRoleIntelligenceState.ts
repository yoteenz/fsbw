import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_ROLE_INTELLIGENCE_UPDATED,
  getOrganizationRoleIntelligenceProfile,
  syncRoleIntelligenceFromSources,
  type OrganizationRoleIntelligenceProfile,
} from '../studio-os-core/role-intelligence';

export function useRoleIntelligenceState() {
  return useStudioProfileState<OrganizationRoleIntelligenceProfile>({
    getProfile: getOrganizationRoleIntelligenceProfile,
    syncProfile: syncRoleIntelligenceFromSources,
    updatedEvent: STUDIO_OS_ROLE_INTELLIGENCE_UPDATED,
  });
}
