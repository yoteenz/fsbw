import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_WORKFLOW_ENGINE_UPDATED,
  getOrganizationWorkflowEngineProfile,
  syncWorkflowEngineFromSources,
  type OrganizationWorkflowEngineProfile,
} from '../studio-os-core/workflow-engine';

export function useWorkflowEngineState() {
  return useStudioProfileState<OrganizationWorkflowEngineProfile>({
    getProfile: getOrganizationWorkflowEngineProfile,
    syncProfile: syncWorkflowEngineFromSources,
    updatedEvent: STUDIO_OS_WORKFLOW_ENGINE_UPDATED,
  });
}
