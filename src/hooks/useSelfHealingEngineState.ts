import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_SELF_HEALING_ENGINE_UPDATED,
  getOrganizationSelfHealingEngineProfile,
  syncSelfHealingEngineFromSources,
  type OrganizationSelfHealingEngineProfile,
} from '../studio-os-core/self-healing-engine';

export function useSelfHealingEngineState() {
  return useStudioProfileState<OrganizationSelfHealingEngineProfile>({
    getProfile: getOrganizationSelfHealingEngineProfile,
    syncProfile: syncSelfHealingEngineFromSources,
    updatedEvent: STUDIO_OS_SELF_HEALING_ENGINE_UPDATED,
  });
}
