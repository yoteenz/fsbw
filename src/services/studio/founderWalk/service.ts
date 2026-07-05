import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readFounderWalkStore } from '../../../studio-os-core/founder-walk/store';

export type FounderWalkSnapshot = ReturnType<typeof readFounderWalkStore>;

export const FOUNDER_WALK_CHAIN = [
  'PHILOSOPHY',
  'DAYONE',
  'PATHWAY',
  'MEMORY',
  'REFLECT',
  'LEGACY',
  'CONNECT',
  'COMPOUND',
] as const;

export const founderWalkStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<FounderWalkSnapshot>>;
} = {
  id: 'founder-walk',
  label: 'FOUNDER WALK',
  phase: 2,
  enabled: false,
  description: 'EMOTIONAL SPINE OF THE CAMPUS — LEGACY · NOT TROPHIES',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Founder Walk requires browser context.');
    }
    return { ok: true, data: readFounderWalkStore() };
  },
};
