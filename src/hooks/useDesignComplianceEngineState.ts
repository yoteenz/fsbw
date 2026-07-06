import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_DESIGN_COMPLIANCE_ENGINE_UPDATED,
  getOrganizationDesignComplianceEngineProfile,
  syncDesignComplianceEngineFromSources,
  type OrganizationDesignComplianceEngineProfile,
} from '../studio-os-core/design-compliance-engine';

export function useDesignComplianceEngineState() {
  return useStudioProfileState<OrganizationDesignComplianceEngineProfile>({
    getProfile: getOrganizationDesignComplianceEngineProfile,
    syncProfile: syncDesignComplianceEngineFromSources,
    updatedEvent: STUDIO_OS_DESIGN_COMPLIANCE_ENGINE_UPDATED,
  });
}
