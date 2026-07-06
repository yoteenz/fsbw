import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_ACCESSIBILITY_AUDITOR_UPDATED,
  getOrganizationAccessibilityAuditorProfile,
  syncAccessibilityAuditorFromSources,
  type OrganizationAccessibilityAuditorProfile,
} from '../studio-os-core/accessibility-auditor';

export function useAccessibilityAuditorState() {
  return useStudioProfileState<OrganizationAccessibilityAuditorProfile>({
    getProfile: getOrganizationAccessibilityAuditorProfile,
    syncProfile: syncAccessibilityAuditorFromSources,
    updatedEvent: STUDIO_OS_ACCESSIBILITY_AUDITOR_UPDATED,
  });
}
