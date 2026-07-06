import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_WORKSPACE_RUNTIME_UPDATED,
  getOrganizationWorkspaceRuntimeProfile,
  syncWorkspaceRuntimeFromSources,
  type OrganizationWorkspaceRuntimeProfile,
} from '../studio-os-core/workspace-runtime';

export function useWorkspaceRuntimeState() {
  return useStudioProfileState<OrganizationWorkspaceRuntimeProfile>({
    getProfile: getOrganizationWorkspaceRuntimeProfile,
    syncProfile: syncWorkspaceRuntimeFromSources,
    updatedEvent: STUDIO_OS_WORKSPACE_RUNTIME_UPDATED,
  });
}
