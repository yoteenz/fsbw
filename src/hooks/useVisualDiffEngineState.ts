import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_VISUAL_DIFF_ENGINE_UPDATED,
  getOrganizationVisualDiffEngineProfile,
  syncVisualDiffEngineFromSources,
  type OrganizationVisualDiffEngineProfile,
} from '../studio-os-core/visual-diff-engine';

export function useVisualDiffEngineState() {
  return useStudioProfileState<OrganizationVisualDiffEngineProfile>({
    getProfile: getOrganizationVisualDiffEngineProfile,
    syncProfile: syncVisualDiffEngineFromSources,
    updatedEvent: STUDIO_OS_VISUAL_DIFF_ENGINE_UPDATED,
  });
}
