import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_PRESENCE_ENGINE_UPDATED,
  getOrganizationPresenceProfile,
  syncPresenceEngineFromSources,
  type OrganizationPresenceProfile,
} from '../studio-os-core/presence-engine';

export function usePresenceEngineState() {
  return useStudioProfileState<OrganizationPresenceProfile>({
    getProfile: getOrganizationPresenceProfile,
    syncProfile: syncPresenceEngineFromSources,
    updatedEvent: STUDIO_OS_PRESENCE_ENGINE_UPDATED,
  });
}
