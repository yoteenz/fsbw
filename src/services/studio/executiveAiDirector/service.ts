import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { EXECUTIVE_AI_DIRECTOR_INHERITANCE_CHAIN } from '../../../utils/adminStudioExecutiveAiDirectorDemo';
import { exportExecutiveAiDirectorSnapshot } from '../../../hooks/useAdminStudioExecutiveAiDirectorState';

export type ExecutiveAiDirectorSnapshot = ReturnType<typeof exportExecutiveAiDirectorSnapshot>;

export type ExecutiveAiDirectorSummary = {
  memoryCount: number;
  draftCount: number;
  inheritanceChain: readonly string[];
};

export const executiveAiDirectorStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ExecutiveAiDirectorSnapshot>>;
  getSummary(): Promise<StudioServiceResult<ExecutiveAiDirectorSummary>>;
} = {
  id: 'executive-ai-director',
  label: 'EXECUTIVE AI DIRECTOR',
  phase: 2,
  enabled: false,
  description:
    'STRATEGIC INTELLIGENCE — BRIEF · COACHING · FORECAST · WORKSPACE MEMORY · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Executive AI Director requires browser context.');
    }
    return { ok: true, data: exportExecutiveAiDirectorSnapshot() };
  },
  async getSummary() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Executive AI Director summary requires browser context.');
    }
    const snap = exportExecutiveAiDirectorSnapshot();
    return {
      ok: true,
      data: {
        memoryCount: snap.memory.length,
        draftCount: snap.productionDraftCount,
        inheritanceChain: EXECUTIVE_AI_DIRECTOR_INHERITANCE_CHAIN,
      },
    };
  },
};

export { EXECUTIVE_AI_DIRECTOR_INHERITANCE_CHAIN };
