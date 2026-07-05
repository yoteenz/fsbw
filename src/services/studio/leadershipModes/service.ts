import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readLeadershipModesStore } from '../../../studio-os-core/leadership-modes/store';

export type LeadershipModesSnapshot = ReturnType<typeof readLeadershipModesStore>;

export const LEADERSHIP_MODES_CHAIN = [
  'FOUNDER',
  'EXECUTIVE',
  'CREATOR',
  'OPERATOR',
  'ADAPTIVE',
  'PERSPECTIVE',
  'LEADERSHIP',
] as const;

export const leadershipModesStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<LeadershipModesSnapshot>>;
} = {
  id: 'leadership-modes',
  label: 'LEADERSHIP MODES',
  phase: 2,
  enabled: false,
  description: 'FOUNDER & EXECUTIVE MODE · ADAPTIVE LEADERSHIP · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Leadership Modes requires browser context.');
    }
    return { ok: true, data: readLeadershipModesStore() };
  },
};
