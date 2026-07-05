import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readScreeningRoomStore } from '../../../studio-os-core/screening-room/store';

export type ScreeningRoomModuleSnapshot = ReturnType<typeof readScreeningRoomStore>;

export const SCREENING_ROOM_CHAIN = [
  'EXPERIENCE',
  'COMPARE',
  'CONCIERGE',
  'APPROVE',
  'PUBLISH',
] as const;

export const screeningRoomModuleService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ScreeningRoomModuleSnapshot>>;
} = {
  id: 'screening-room',
  label: 'SCREENING ROOM',
  phase: 2,
  enabled: false,
  description: 'LUXURY REVIEW THEATER · PRIVATE CINEMA · PRE-PUBLICATION · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Screening Room requires browser context.');
    }
    return { ok: true, data: readScreeningRoomStore() };
  },
};
