import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_RELATIONSHIP_MEMORY_UPDATED,
  getOrganizationRelationshipMemoryProfile,
  syncRelationshipMemoryFromSources,
  type OrganizationRelationshipMemoryProfile,
} from '../studio-os-core/relationship-memory';

export function useRelationshipMemoryState() {
  return useStudioProfileState<OrganizationRelationshipMemoryProfile>({
    getProfile: getOrganizationRelationshipMemoryProfile,
    syncProfile: syncRelationshipMemoryFromSources,
    updatedEvent: STUDIO_OS_RELATIONSHIP_MEMORY_UPDATED,
  });
}
