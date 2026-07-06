import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_FOUNDER_COGNITIVE_LOAD_UPDATED,
  getOrganizationFounderCognitiveLoadProfile,
  syncFounderCognitiveLoadFromSources,
  type OrganizationFounderCognitiveLoadProfile,
} from '../studio-os-core/founder-cognitive-load';

export function useFounderCognitiveLoadState() {
  return useStudioProfileState<OrganizationFounderCognitiveLoadProfile>({
    getProfile: getOrganizationFounderCognitiveLoadProfile,
    syncProfile: syncFounderCognitiveLoadFromSources,
    updatedEvent: STUDIO_OS_FOUNDER_COGNITIVE_LOAD_UPDATED,
  });
}
