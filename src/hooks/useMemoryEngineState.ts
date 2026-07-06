import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_MEMORY_ENGINE_UPDATED,
  getOrganizationMemoryProfile,
  syncMemoryEngineFromSources,
  type OrganizationMemoryProfile,
} from '../studio-os-core/memory-engine';

export function useMemoryEngineState() {
  return useStudioProfileState<OrganizationMemoryProfile>({
    getProfile: getOrganizationMemoryProfile,
    syncProfile: syncMemoryEngineFromSources,
    updatedEvent: STUDIO_OS_MEMORY_ENGINE_UPDATED,
  });
}
