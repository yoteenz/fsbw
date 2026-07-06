import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_SHADOW_MODE_UPDATED,
  getOrganizationShadowModeProfile,
  syncShadowModeFromSources,
  type OrganizationShadowModeProfile,
} from '../studio-os-core/shadow-mode';

export function useShadowModeState() {
  return useStudioProfileState<OrganizationShadowModeProfile>({
    getProfile: getOrganizationShadowModeProfile,
    syncProfile: syncShadowModeFromSources,
    updatedEvent: STUDIO_OS_SHADOW_MODE_UPDATED,
  });
}
