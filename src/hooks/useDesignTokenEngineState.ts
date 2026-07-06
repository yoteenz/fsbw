import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_DESIGN_TOKEN_ENGINE_UPDATED,
  getOrganizationDesignTokenEngineProfile,
  syncDesignTokenEngineFromSources,
  type OrganizationDesignTokenEngineProfile,
} from '../studio-os-core/design-token-engine';

export function useDesignTokenEngineState() {
  return useStudioProfileState<OrganizationDesignTokenEngineProfile>({
    getProfile: getOrganizationDesignTokenEngineProfile,
    syncProfile: syncDesignTokenEngineFromSources,
    updatedEvent: STUDIO_OS_DESIGN_TOKEN_ENGINE_UPDATED,
  });
}
