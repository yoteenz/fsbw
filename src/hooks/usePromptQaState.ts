import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_PROMPT_QA_UPDATED,
  getOrganizationPromptQaProfile,
  syncPromptQaFromSources,
  type OrganizationPromptQaProfile,
} from '../studio-os-core/prompt-qa';

export function usePromptQaState() {
  return useStudioProfileState<OrganizationPromptQaProfile>({
    getProfile: getOrganizationPromptQaProfile,
    syncProfile: syncPromptQaFromSources,
    updatedEvent: STUDIO_OS_PROMPT_QA_UPDATED,
  });
}
