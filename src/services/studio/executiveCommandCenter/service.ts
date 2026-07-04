import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  EXECUTIVE_CREATIVE_BRIEFING,
  EXECUTIVE_REPORTING_CHAIN,
  EXECUTIVE_RISKS,
  EXECUTIVE_OPPORTUNITIES,
} from '../../../utils/adminStudioExecutiveCommandCenterDemo';
import { exportExecutiveCommandCenterSnapshot } from '../../../hooks/useAdminStudioExecutiveCommandCenterState';

export type ExecutiveCommandCenterSnapshot = ReturnType<typeof exportExecutiveCommandCenterSnapshot>;

export type ExecutiveSummary = {
  briefing: typeof EXECUTIVE_CREATIVE_BRIEFING;
  pendingDecisions: number;
  riskCount: number;
  opportunityCount: number;
  reportingChain: readonly string[];
};

export const executiveCommandCenterStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ExecutiveCommandCenterSnapshot>>;
  getExecutiveSummary(): Promise<StudioServiceResult<ExecutiveSummary>>;
} = {
  id: 'executive-command-center',
  label: 'EXECUTIVE COMMAND CENTER',
  phase: 2,
  enabled: false,
  description:
    'CEO HEADQUARTERS — LIVE SUMMARY FROM ALL STUDIO MODULES · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Executive Command Center requires browser context.');
    }
    return { ok: true, data: exportExecutiveCommandCenterSnapshot() };
  },
  async getExecutiveSummary() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Executive summary requires browser context.');
    }
    const snap = exportExecutiveCommandCenterSnapshot();
    return {
      ok: true,
      data: {
        briefing: EXECUTIVE_CREATIVE_BRIEFING,
        pendingDecisions: snap.decisions.filter((d) => d.status === 'pending').length,
        riskCount: EXECUTIVE_RISKS.length,
        opportunityCount: EXECUTIVE_OPPORTUNITIES.length,
        reportingChain: EXECUTIVE_REPORTING_CHAIN,
      },
    };
  },
};

export { EXECUTIVE_REPORTING_CHAIN };
