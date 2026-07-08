import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_KNOWLEDGE_CORE_UPDATED,
  getOrganizationKnowledgeCoreProfile,
  syncKnowledgeCoreFromSources,
  type OrganizationKnowledgeCoreProfile,
} from '../studio-os-core/studio-world-knowledge-core';

export function useKnowledgeCoreState() {
  return useStudioProfileState<OrganizationKnowledgeCoreProfile>({
    getProfile: getOrganizationKnowledgeCoreProfile,
    syncProfile: syncKnowledgeCoreFromSources,
    updatedEvent: STUDIO_OS_KNOWLEDGE_CORE_UPDATED,
  });
}
