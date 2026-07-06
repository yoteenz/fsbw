import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_REGRESSION_ENGINE_UPDATED,
  getOrganizationRegressionEngineProfile,
  syncRegressionEngineFromSources,
  type OrganizationRegressionEngineProfile,
} from '../studio-os-core/regression-engine';

export function useRegressionEngineState() {
  return useStudioProfileState<OrganizationRegressionEngineProfile>({
    getProfile: getOrganizationRegressionEngineProfile,
    syncProfile: syncRegressionEngineFromSources,
    updatedEvent: STUDIO_OS_REGRESSION_ENGINE_UPDATED,
  });
}
