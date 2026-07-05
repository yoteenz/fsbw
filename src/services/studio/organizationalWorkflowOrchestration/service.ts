import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readOrganizationalWorkflowOrchestrationStore } from '../../../studio-os-core/organizational-workflow-orchestration/store';

export type OrganizationalWorkflowOrchestrationSnapshot = ReturnType<
  typeof readOrganizationalWorkflowOrchestrationStore
>;

export const ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_CHAIN = [
  'PHILOSOPHY',
  'ORCHESTRATE',
  'COORDINATE',
  'LIVING',
  'TRANSPARENCY',
  'MEMORY',
  'CHOREOGRAPHY',
] as const;

export const organizationalWorkflowOrchestrationStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<OrganizationalWorkflowOrchestrationSnapshot>>;
} = {
  id: 'organizational-workflow-orchestration',
  label: 'ORGANIZATIONAL WORKFLOW ORCHESTRATION',
  phase: 2,
  enabled: false,
  description: 'CROSS-FUNCTIONAL WORKFLOW CHOREOGRAPHY · COORDINATED TEAMS · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Organizational Workflow Orchestration requires browser context.');
    }
    return { ok: true, data: readOrganizationalWorkflowOrchestrationStore() };
  },
};
