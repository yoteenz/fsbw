import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_POLICY_ENGINE_UPDATED,
  getOrganizationPolicyEngineProfile,
  syncPolicyEngineFromSources,
  type OrganizationPolicyEngineProfile,
} from '../studio-os-core/policy-engine';

export function usePolicyEngineState() {
  return useStudioProfileState<OrganizationPolicyEngineProfile>({
    getProfile: getOrganizationPolicyEngineProfile,
    syncProfile: syncPolicyEngineFromSources,
    updatedEvent: STUDIO_OS_POLICY_ENGINE_UPDATED,
  });
}
