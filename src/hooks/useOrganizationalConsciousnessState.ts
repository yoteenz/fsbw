import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_ORGANIZATIONAL_CONSCIOUSNESS_UPDATED,
  getOrganizationConsciousnessProfile,
  syncOrganizationalConsciousnessFromSources,
  type OrganizationConsciousnessProfile,
} from '../studio-os-core/organizational-consciousness';

export function useOrganizationalConsciousnessState() {
  return useStudioProfileState<OrganizationConsciousnessProfile>({
    getProfile: getOrganizationConsciousnessProfile,
    syncProfile: syncOrganizationalConsciousnessFromSources,
    updatedEvent: STUDIO_OS_ORGANIZATIONAL_CONSCIOUSNESS_UPDATED,
  });
}
