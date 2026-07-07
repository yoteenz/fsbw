import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_KNOWLEDGE_REGISTRY_UPDATED,
  getOrganizationKnowledgeRegistryProfile,
  syncKnowledgeRegistryFromSources,
  type OrganizationKnowledgeRegistryProfile,
} from '../studio-os-core/knowledge-registry';

export function useKnowledgeRegistryState() {
  return useStudioProfileState<OrganizationKnowledgeRegistryProfile>({
    getProfile: getOrganizationKnowledgeRegistryProfile,
    syncProfile: syncKnowledgeRegistryFromSources,
    updatedEvent: STUDIO_OS_KNOWLEDGE_REGISTRY_UPDATED,
  });
}

/** @deprecated */
export function useDocumentationRegistryState() {
  return useKnowledgeRegistryState();
}
