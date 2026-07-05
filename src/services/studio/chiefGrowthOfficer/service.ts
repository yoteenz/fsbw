import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readChiefGrowthOfficerStore } from '../../../studio-os-core/chief-growth-officer/store';

export type ChiefGrowthOfficerSnapshot = ReturnType<typeof readChiefGrowthOfficerStore>;

export const CHIEF_GROWTH_OFFICER_CHAIN = [
  'PHILOSOPHY',
  'GOVERN',
  'ALIGN',
  'INTELLIGENCE',
  'LABORATORY',
  'PROTECT',
  'COUNCIL',
  'COMPOUND',
] as const;

export const chiefGrowthOfficerStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ChiefGrowthOfficerSnapshot>>;
} = {
  id: 'chief-growth-officer',
  label: 'CHIEF GROWTH OFFICER',
  phase: 2,
  enabled: false,
  description: 'LIFELONG GUARDIAN OF SUSTAINABLE GROWTH · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Chief Growth Officer requires browser context.');
    }
    return { ok: true, data: readChiefGrowthOfficerStore() };
  },
};
