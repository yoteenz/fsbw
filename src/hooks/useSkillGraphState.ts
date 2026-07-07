import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_SKILL_GRAPH_UPDATED,
  getOrganizationSkillGraphProfile,
  syncSkillGraphFromSources,
  type OrganizationSkillGraphProfile,
} from '../studio-os-core/skill-graph';

export function useSkillGraphState() {
  return useStudioProfileState<OrganizationSkillGraphProfile>({
    getProfile: getOrganizationSkillGraphProfile,
    syncProfile: syncSkillGraphFromSources,
    updatedEvent: STUDIO_OS_SKILL_GRAPH_UPDATED,
  });
}
