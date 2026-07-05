import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readChiefExperienceOfficerStore } from '../../../studio-os-core/chief-experience-officer/store';

export type ChiefExperienceOfficerSnapshot = ReturnType<typeof readChiefExperienceOfficerStore>;

export const CHIEF_EXPERIENCE_OFFICER_CHAIN = [
  'PHILOSOPHY',
  'GOVERN',
  'ALIGN',
  'JOURNEY',
  'STUDIO',
  'PROTECT',
  'COUNCIL',
  'COMPOUND',
] as const;

export const chiefExperienceOfficerStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ChiefExperienceOfficerSnapshot>>;
} = {
  id: 'chief-experience-officer',
  label: 'CHIEF EXPERIENCE OFFICER',
  phase: 2,
  enabled: false,
  description: 'LIFELONG GUARDIAN OF CUSTOMER EXPERIENCE · V2.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Chief Experience Officer requires browser context.');
    }
    return { ok: true, data: readChiefExperienceOfficerStore() };
  },
};
