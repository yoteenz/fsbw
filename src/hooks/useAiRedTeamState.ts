import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_AI_RED_TEAM_UPDATED,
  getOrganizationAiRedTeamProfile,
  syncAiRedTeamFromSources,
  type OrganizationAiRedTeamProfile,
} from '../studio-os-core/ai-red-team';

export function useAiRedTeamState() {
  return useStudioProfileState<OrganizationAiRedTeamProfile>({
    getProfile: getOrganizationAiRedTeamProfile,
    syncProfile: syncAiRedTeamFromSources,
    updatedEvent: STUDIO_OS_AI_RED_TEAM_UPDATED,
  });
}
