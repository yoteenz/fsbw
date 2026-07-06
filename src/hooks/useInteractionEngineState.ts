import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_INTERACTION_ENGINE_UPDATED,
  getOrganizationInteractionEngineProfile,
  syncInteractionEngineFromSources,
  type OrganizationInteractionEngineProfile,
} from '../studio-os-core/interaction-engine';

export function useInteractionEngineState() {
  return useStudioProfileState<OrganizationInteractionEngineProfile>({
    getProfile: getOrganizationInteractionEngineProfile,
    syncProfile: syncInteractionEngineFromSources,
    updatedEvent: STUDIO_OS_INTERACTION_ENGINE_UPDATED,
  });
}
