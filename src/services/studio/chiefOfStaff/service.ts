import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readChiefOfStaffStore } from '../../../studio-os-core/chief-of-staff/store';

export type ChiefOfStaffSnapshot = ReturnType<typeof readChiefOfStaffStore>;

export const CHIEF_OF_STAFF_INHERITANCE_CHAIN = [
  'FOUNDER',
  'CHIEF OF STAFF',
  'EXECUTIVE LEADERSHIP',
  'DEPARTMENTS',
  'WORKERS',
  'TASKS',
] as const;

export const chiefOfStaffStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ChiefOfStaffSnapshot>>;
} = {
  id: 'chief-of-staff',
  label: 'CHIEF OF STAFF',
  phase: 2,
  enabled: false,
  description: 'FOUNDER PRIMARY EXECUTIVE — SOFT APPROVALS · ATTENTION PROTECTION · DECISION LEARNING',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Chief of Staff requires browser context.');
    }
    return { ok: true, data: readChiefOfStaffStore() };
  },
};

export { CHIEF_OF_STAFF_INHERITANCE_CHAIN as COS_INHERITANCE_CHAIN };
