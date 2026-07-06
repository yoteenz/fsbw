import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_MODEL_ORCHESTRATOR_UPDATED,
  getOrganizationModelOrchestratorProfile,
  syncModelOrchestratorFromSources,
  type OrganizationModelOrchestratorProfile,
} from '../studio-os-core/model-orchestrator';

export function useModelOrchestratorState() {
  return useStudioProfileState<OrganizationModelOrchestratorProfile>({
    getProfile: getOrganizationModelOrchestratorProfile,
    syncProfile: syncModelOrchestratorFromSources,
    updatedEvent: STUDIO_OS_MODEL_ORCHESTRATOR_UPDATED,
  });
}
