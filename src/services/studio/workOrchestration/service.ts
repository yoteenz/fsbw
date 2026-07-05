import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readWorkOrchestrationStore } from '../../../studio-os-core/work-orchestration/store';

export type WorkOrchestrationSnapshot = ReturnType<typeof readWorkOrchestrationStore>;

export const WORK_ORCHESTRATION_CHAIN = [
  'OBJECTIVE',
  'INITIATIVE',
  'CAMPAIGN',
  'WORK PACKAGE',
  'DELIVERABLES',
  'ACTIVITIES',
  'COMPLETION',
] as const;

export const workOrchestrationStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<WorkOrchestrationSnapshot>>;
} = {
  id: 'work-orchestration',
  label: 'WORK ORCHESTRATION',
  phase: 2,
  enabled: false,
  description: 'INTELLIGENT EXECUTION — WORK PACKAGES · DEPENDENCIES · CoS ORCHESTRATION · FOUNDER WORKSPACE',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Work Orchestration requires browser context.');
    }
    return { ok: true, data: readWorkOrchestrationStore() };
  },
};
