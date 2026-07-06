import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_STATE_ENGINE_UPDATED,
  getOrganizationStateEngineProfile,
  syncStateEngineFromSources,
  type OrganizationStateEngineProfile,
} from '../studio-os-core/state-engine';

export function useStateEngineState() {
  return useStudioProfileState<OrganizationStateEngineProfile>({
    getProfile: getOrganizationStateEngineProfile,
    syncProfile: syncStateEngineFromSources,
    updatedEvent: STUDIO_OS_STATE_ENGINE_UPDATED,
  });
}
