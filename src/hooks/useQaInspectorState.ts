import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_QA_INSPECTOR_UPDATED,
  getOrganizationQaInspectorProfile,
  syncQaInspectorFromSources,
  type OrganizationQaInspectorProfile,
} from '../studio-os-core/qa-inspector';

export function useQaInspectorState() {
  return useStudioProfileState<OrganizationQaInspectorProfile>({
    getProfile: getOrganizationQaInspectorProfile,
    syncProfile: syncQaInspectorFromSources,
    updatedEvent: STUDIO_OS_QA_INSPECTOR_UPDATED,
  });
}
