import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_MEMORY_SYSTEM_UPDATED,
  seedMemorySystemFromCanon,
  getOrganizationMemorySystemProfile,
  syncMemorySystemFromSources,
  type OrganizationMemorySystemProfile,
} from '../studio-os-core/studio-world-memory-system';

export function useMemorySystemState() {
  return useStudioProfileState<OrganizationMemorySystemProfile>({
    getProfile: (organizationId) => {
      seedMemorySystemFromCanon();
      return getOrganizationMemorySystemProfile(organizationId);
    },
    syncProfile: syncMemorySystemFromSources,
    updatedEvent: STUDIO_OS_MEMORY_SYSTEM_UPDATED,
  });
}
