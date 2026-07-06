import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_WORLD_KNOWLEDGE_ENGINE_UPDATED,
  getOrganizationWorldKnowledgeProfile,
  syncWorldKnowledgeEngineFromSources,
  type OrganizationWorldKnowledgeProfile,
} from '../studio-os-core/world-knowledge-engine';

export function useWorldKnowledgeEngineState() {
  return useStudioProfileState<OrganizationWorldKnowledgeProfile>({
    getProfile: getOrganizationWorldKnowledgeProfile,
    syncProfile: syncWorldKnowledgeEngineFromSources,
    updatedEvent: STUDIO_OS_WORLD_KNOWLEDGE_ENGINE_UPDATED,
  });
}
