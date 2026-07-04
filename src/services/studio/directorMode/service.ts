import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { DIRECTOR_MODE_INHERITANCE_CHAIN } from '../../../utils/adminStudioDirectorModeDemo';
import { exportDirectorModeSnapshot } from '../../../hooks/useAdminStudioDirectorModeState';

export type DirectorModeSnapshot = ReturnType<typeof exportDirectorModeSnapshot>;

export type DirectorModeSummary = {
  sessionCount: number;
  inheritanceChain: readonly string[];
};

export const directorModeStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<DirectorModeSnapshot>>;
  getSummary(): Promise<StudioServiceResult<DirectorModeSummary>>;
} = {
  id: 'director-mode',
  label: 'DIRECTOR MODE',
  phase: 2,
  enabled: false,
  description:
    'CINEMATIC REHEARSAL — TIMELINE · CINEMA PREVIEW · SHOT LIST · READINESS · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Director Mode requires browser context.');
    }
    return { ok: true, data: exportDirectorModeSnapshot() };
  },
  async getSummary() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Director Mode summary requires browser context.');
    }
    const snap = exportDirectorModeSnapshot();
    return {
      ok: true,
      data: {
        sessionCount: Object.keys(snap.sessions).length,
        inheritanceChain: DIRECTOR_MODE_INHERITANCE_CHAIN,
      },
    };
  },
};

export { DIRECTOR_MODE_INHERITANCE_CHAIN };
