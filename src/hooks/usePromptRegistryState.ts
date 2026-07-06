import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_PROMPT_REGISTRY_UPDATED,
  getOrganizationPromptRegistryProfile,
  syncPromptRegistryFromSources,
  type OrganizationPromptRegistryProfile,
} from '../studio-os-core/prompt-registry';

export function usePromptRegistryState() {
  return useStudioProfileState<OrganizationPromptRegistryProfile>({
    getProfile: getOrganizationPromptRegistryProfile,
    syncProfile: syncPromptRegistryFromSources,
    updatedEvent: STUDIO_OS_PROMPT_REGISTRY_UPDATED,
  });
}
