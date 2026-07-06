import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_ANTICIPATION_ENGINE_UPDATED,
  getOrganizationAnticipationProfile,
  syncAnticipationEngineFromSources,
  type OrganizationAnticipationProfile,
} from '../studio-os-core/anticipation-engine';

export function useAnticipationEngineState() {
  return useStudioProfileState<OrganizationAnticipationProfile>({
    getProfile: getOrganizationAnticipationProfile,
    syncProfile: syncAnticipationEngineFromSources,
    updatedEvent: STUDIO_OS_ANTICIPATION_ENGINE_UPDATED,
  });
}
