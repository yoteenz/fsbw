import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { PENDING_APPROVALS, MISSION_CONTROL_INHERITANCE_CHAIN } from '../../../utils/adminStudioMissionControlDemo';
import { exportMissionControlSnapshot } from '../../../hooks/useAdminStudioMissionControlState';

export type MissionControlSnapshot = ReturnType<typeof exportMissionControlSnapshot>;

export type MissionControlSummary = {
  pendingApprovals: number;
  inheritanceChain: readonly string[];
};

export const missionControlStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<MissionControlSnapshot>>;
  getSummary(): Promise<StudioServiceResult<MissionControlSummary>>;
} = {
  id: 'mission-control',
  label: 'MISSION CONTROL',
  phase: 2,
  enabled: false,
  description: 'WORKSPACE EXECUTIVE HQ — BRIEF · MISSIONS · DEPARTMENTS · APPROVALS · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Mission Control requires browser context.');
    }
    return { ok: true, data: exportMissionControlSnapshot() };
  },
  async getSummary() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Mission Control summary requires browser context.');
    }
    const snap = exportMissionControlSnapshot();
    const approvedCount = Object.values(snap.approvals).filter((s) => s === 'approved').length;
    const pending = PENDING_APPROVALS.length - approvedCount;
    return {
      ok: true,
      data: {
        pendingApprovals: pending,
        inheritanceChain: MISSION_CONTROL_INHERITANCE_CHAIN,
      },
    };
  },
};

export { MISSION_CONTROL_INHERITANCE_CHAIN };
