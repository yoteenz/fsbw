import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_CONFIDENCE_ENGINE_UPDATED,
  getOrganizationConfidenceEngineProfile,
  syncConfidenceEngineFromSources,
  type OrganizationConfidenceEngineProfile,
} from '../studio-os-core/confidence-engine';

export function useConfidenceEngineState() {
  return useStudioProfileState<OrganizationConfidenceEngineProfile>({
    getProfile: getOrganizationConfidenceEngineProfile,
    syncProfile: syncConfidenceEngineFromSources,
    updatedEvent: STUDIO_OS_CONFIDENCE_ENGINE_UPDATED,
  });
}
