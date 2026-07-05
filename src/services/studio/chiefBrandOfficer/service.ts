import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readChiefBrandOfficerStore } from '../../../studio-os-core/chief-brand-officer/store';

export type ChiefBrandOfficerSnapshot = ReturnType<typeof readChiefBrandOfficerStore>;

export const CHIEF_BRAND_OFFICER_CHAIN = [
  'PHILOSOPHY',
  'GOVERN',
  'ALIGN',
  'INTELLIGENCE',
  'STUDIO',
  'PROTECT',
  'COUNCIL',
  'COMPOUND',
] as const;

export const chiefBrandOfficerStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ChiefBrandOfficerSnapshot>>;
} = {
  id: 'chief-brand-officer',
  label: 'CHIEF BRAND OFFICER',
  phase: 2,
  enabled: false,
  description: 'LIFELONG GUARDIAN OF ORGANIZATIONAL IDENTITY · V2.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Chief Brand Officer requires browser context.');
    }
    return { ok: true, data: readChiefBrandOfficerStore() };
  },
};
