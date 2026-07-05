import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readConciergeApprovalFlowStore } from '../../../studio-os-core/concierge-approval-flow/store';

export type ConciergeApprovalFlowModuleSnapshot = ReturnType<typeof readConciergeApprovalFlowStore>;

export const CONCIERGE_APPROVAL_FLOW_CHAIN = [
  'CONCIERGE',
  'REVIEW',
  'BRIEF',
  'FOUNDER',
  'PUBLISH',
] as const;

export const conciergeApprovalFlowModuleService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ConciergeApprovalFlowModuleSnapshot>>;
} = {
  id: 'concierge-approval-flow',
  label: 'CONCIERGE APPROVAL FLOW',
  phase: 2,
  enabled: false,
  description: 'EDITORIAL BOARD · CONCIERGE REVIEW · UNIFIED FOUNDER BRIEF · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Concierge Approval Flow requires browser context.');
    }
    return { ok: true, data: readConciergeApprovalFlowStore() };
  },
};
