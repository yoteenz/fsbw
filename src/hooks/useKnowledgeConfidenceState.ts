import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_KNOWLEDGE_CONFIDENCE_UPDATED,
  getOrganizationKnowledgeConfidenceProfile,
  syncKnowledgeConfidenceFromSources,
  type OrganizationKnowledgeConfidenceProfile,
} from '../studio-os-core/knowledge-confidence';

export function useKnowledgeConfidenceState() {
  return useStudioProfileState<OrganizationKnowledgeConfidenceProfile>({
    getProfile: getOrganizationKnowledgeConfidenceProfile,
    syncProfile: syncKnowledgeConfidenceFromSources,
    updatedEvent: STUDIO_OS_KNOWLEDGE_CONFIDENCE_UPDATED,
  });
}
