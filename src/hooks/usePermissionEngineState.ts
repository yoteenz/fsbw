import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_PERMISSION_ENGINE_UPDATED,
  getOrganizationPermissionEngineProfile,
  syncPermissionEngineFromSources,
  type OrganizationPermissionEngineProfile,
} from '../studio-os-core/permission-engine';

export function usePermissionEngineState() {
  return useStudioProfileState<OrganizationPermissionEngineProfile>({
    getProfile: getOrganizationPermissionEngineProfile,
    syncProfile: syncPermissionEngineFromSources,
    updatedEvent: STUDIO_OS_PERMISSION_ENGINE_UPDATED,
  });
}
