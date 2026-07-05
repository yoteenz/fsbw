import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readChiefTechnologyOfficerStore } from '../../../studio-os-core/chief-technology-officer/store';

export type ChiefTechnologyOfficerSnapshot = ReturnType<typeof readChiefTechnologyOfficerStore>;

export const CHIEF_TECHNOLOGY_OFFICER_CHAIN = [
  'PHILOSOPHY',
  'GOVERN',
  'ALIGN',
  'INTELLIGENCE',
  'PLATFORM',
  'OPS',
  'PROTECT',
  'COUNCIL',
  'COMPOUND',
] as const;

export const chiefTechnologyOfficerStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ChiefTechnologyOfficerSnapshot>>;
} = {
  id: 'chief-technology-officer',
  label: 'CHIEF TECHNOLOGY OFFICER',
  phase: 2,
  enabled: false,
  description: 'LIFELONG GUARDIAN OF ENGINEERING & INFRASTRUCTURE · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Chief Technology Officer requires browser context.');
    }
    return { ok: true, data: readChiefTechnologyOfficerStore() };
  },
};
