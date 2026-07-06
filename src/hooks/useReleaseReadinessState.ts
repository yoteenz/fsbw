import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_RELEASE_READINESS_UPDATED,
  getOrganizationReleaseReadinessProfile,
  syncReleaseReadinessFromSources,
  type OrganizationReleaseReadinessProfile,
} from '../studio-os-core/release-readiness';

export function useReleaseReadinessState() {
  return useStudioProfileState<OrganizationReleaseReadinessProfile>({
    getProfile: getOrganizationReleaseReadinessProfile,
    syncProfile: syncReleaseReadinessFromSources,
    updatedEvent: STUDIO_OS_RELEASE_READINESS_UPDATED,
  });
}
