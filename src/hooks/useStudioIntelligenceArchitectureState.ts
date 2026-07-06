import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_STUDIO_INTELLIGENCE_ARCHITECTURE_UPDATED,
  getOrganizationStudioIntelligenceArchitectureProfile,
  syncStudioIntelligenceArchitectureFromSources,
  type OrganizationStudioIntelligenceArchitectureProfile,
} from '../studio-os-core/studio-intelligence-architecture';

export function useStudioIntelligenceArchitectureState() {
  return useStudioProfileState<OrganizationStudioIntelligenceArchitectureProfile>({
    getProfile: getOrganizationStudioIntelligenceArchitectureProfile,
    syncProfile: syncStudioIntelligenceArchitectureFromSources,
    updatedEvent: STUDIO_OS_STUDIO_INTELLIGENCE_ARCHITECTURE_UPDATED,
  });
}
