import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readArrivalExperienceStore } from '../../../studio-os-core/arrival-experience/store';

export type ArrivalExperienceSnapshot = ReturnType<typeof readArrivalExperienceStore>;

export const ARRIVAL_EXPERIENCE_CHAIN = [
  'TRANSITION',
  'WELCOME',
  'INTRODUCTIONS',
  'TOUR',
  'REVEAL',
  'BRIEFING',
  'MEMORY',
  'HOME',
] as const;

export const arrivalExperienceStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ArrivalExperienceSnapshot>>;
} = {
  id: 'arrival-experience',
  label: 'ARRIVAL EXPERIENCE',
  phase: 2,
  enabled: false,
  description: 'CEREMONIAL HEADQUARTERS WELCOME · ORGANIZATIONAL ARRIVAL · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Arrival Experience requires browser context.');
    }
    return { ok: true, data: readArrivalExperienceStore() };
  },
};
