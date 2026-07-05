import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readChiefDigitalOfficerStore } from '../../../studio-os-core/chief-digital-officer/store';

export type ChiefDigitalOfficerSnapshot = ReturnType<typeof readChiefDigitalOfficerStore>;

export const CHIEF_DIGITAL_OFFICER_CHAIN = [
  'PHILOSOPHY',
  'GOVERN',
  'ALIGN',
  'INTELLIGENCE',
  'ARCHITECTURE',
  'AI',
  'STUDIO',
  'PROTECT',
  'COUNCIL',
  'COMPOUND',
] as const;

export const chiefDigitalOfficerStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ChiefDigitalOfficerSnapshot>>;
} = {
  id: 'chief-digital-officer',
  label: 'CHIEF DIGITAL OFFICER',
  phase: 2,
  enabled: false,
  description: 'LIFELONG GUARDIAN OF THE DIGITAL ECOSYSTEM · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Chief Digital Officer requires browser context.');
    }
    return { ok: true, data: readChiefDigitalOfficerStore() };
  },
};
