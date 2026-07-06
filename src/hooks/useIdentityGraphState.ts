import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_IDENTITY_GRAPH_UPDATED,
  getOrganizationIdentityGraphProfile,
  syncIdentityGraphFromSources,
  type OrganizationIdentityGraphProfile,
} from '../studio-os-core/identity-graph';

export function useIdentityGraphState() {
  return useStudioProfileState<OrganizationIdentityGraphProfile>({
    getProfile: getOrganizationIdentityGraphProfile,
    syncProfile: syncIdentityGraphFromSources,
    updatedEvent: STUDIO_OS_IDENTITY_GRAPH_UPDATED,
  });
}
