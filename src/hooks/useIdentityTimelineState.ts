import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_IDENTITY_TIMELINE_UPDATED,
  getOrganizationIdentityTimelineProfile,
  syncIdentityTimelineFromSources,
  type OrganizationIdentityTimelineProfile,
} from '../studio-os-core/identity-timeline';

export function useIdentityTimelineState() {
  return useStudioProfileState<OrganizationIdentityTimelineProfile>({
    getProfile: getOrganizationIdentityTimelineProfile,
    syncProfile: syncIdentityTimelineFromSources,
    updatedEvent: STUDIO_OS_IDENTITY_TIMELINE_UPDATED,
  });
}
