import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readExecutiveCouncilStore } from '../../../studio-os-core/executive-council/store';

export type ExecutiveCouncilSnapshot = ReturnType<typeof readExecutiveCouncilStore>;

export const EXECUTIVE_COUNCIL_CHAIN = [
  'PHILOSOPHY',
  'CHAMBER',
  'DEBATE',
  'SYNTHESIS',
  'SIMULATION',
  'LEARNING',
  'OATH',
] as const;

export const executiveCouncilStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ExecutiveCouncilSnapshot>>;
} = {
  id: 'executive-council',
  label: 'EXECUTIVE COUNCIL',
  phase: 2,
  enabled: false,
  description: 'HIGHEST COLLABORATIVE LEADERSHIP BODY · V2.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Executive Council requires browser context.');
    }
    return { ok: true, data: readExecutiveCouncilStore() };
  },
};
