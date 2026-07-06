import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_AMBIENT_AWARENESS_UPDATED,
  getOrganizationAmbientAwarenessProfile,
  syncAmbientAwarenessFromSources,
  type OrganizationAmbientAwarenessProfile,
} from '../studio-os-core/ambient-awareness';

export function useAmbientAwarenessState() {
  return useStudioProfileState<OrganizationAmbientAwarenessProfile>({
    getProfile: getOrganizationAmbientAwarenessProfile,
    syncProfile: syncAmbientAwarenessFromSources,
    updatedEvent: STUDIO_OS_AMBIENT_AWARENESS_UPDATED,
  });
}
