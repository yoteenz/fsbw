import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readLeadershipManifestoFrameworkStore } from '../../../studio-os-core/leadership-manifesto-framework/store';

export type LeadershipManifestoFrameworkSnapshot = ReturnType<typeof readLeadershipManifestoFrameworkStore>;

export const LEADERSHIP_MANIFESTO_FRAMEWORK_CHAIN = [
  'PHILOSOPHY',
  'IDENTITY',
  'BELIEFS',
  'NON-NEGOTIABLES',
  'DECIDE',
  'COMPASS',
  'EXCELLENCE',
  'COMMUNICATE',
  'COLLABORATE',
  'LEARN',
  'LEGACY',
  'INHERIT',
  'COMPOUND',
] as const;

export const leadershipManifestoFrameworkStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<LeadershipManifestoFrameworkSnapshot>>;
} = {
  id: 'leadership-manifesto-framework',
  label: 'LEADERSHIP MANIFESTO FRAMEWORK',
  phase: 2,
  enabled: false,
  description: 'CONSTITUTIONAL FOUNDATION INHERITED BY EVERY EXECUTIVE — LIVING ORGANIZATIONAL DNA',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Leadership Manifesto Framework requires browser context.');
    }
    return { ok: true, data: readLeadershipManifestoFrameworkStore() };
  },
};
