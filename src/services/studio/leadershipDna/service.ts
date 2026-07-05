import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readLeadershipDnaStore } from '../../../studio-os-core/leadership-dna/store';

export type LeadershipDnaSnapshot = ReturnType<typeof readLeadershipDnaStore>;

export const LEADERSHIP_DNA_INHERITANCE_CHAIN = [
  'FOUNDER',
  'LEADERSHIP DNA',
  'CHIEF OF STAFF',
  'EXECUTIVE LEADERSHIP',
  'COMPANY DNA',
  'ORGANIZATIONAL INTELLIGENCE',
] as const;

export const leadershipDnaStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<LeadershipDnaSnapshot>>;
} = {
  id: 'leadership-dna',
  label: 'LEADERSHIP DNA',
  phase: 2,
  enabled: false,
  description: 'FOUNDER OPERATING BLUEPRINT — DECISION FRAMEWORK · APPROVAL PATTERNS · CoS TRAINING',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Leadership DNA requires browser context.');
    }
    return { ok: true, data: readLeadershipDnaStore() };
  },
};
