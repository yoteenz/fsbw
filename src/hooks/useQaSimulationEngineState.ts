import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_QA_SIMULATION_ENGINE_UPDATED,
  getOrganizationQaSimulationEngineProfile,
  syncQaSimulationEngineFromSources,
  type OrganizationQaSimulationEngineProfile,
} from '../studio-os-core/qa-simulation-engine';

export function useQaSimulationEngineState() {
  return useStudioProfileState<OrganizationQaSimulationEngineProfile>({
    getProfile: getOrganizationQaSimulationEngineProfile,
    syncProfile: syncQaSimulationEngineFromSources,
    updatedEvent: STUDIO_OS_QA_SIMULATION_ENGINE_UPDATED,
  });
}
