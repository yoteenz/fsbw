import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readCampusEvolutionStore } from '../../../studio-os-core/campus-evolution-engine/store';

export type CampusEvolutionSnapshot = ReturnType<typeof readCampusEvolutionStore>;

export const CAMPUS_EVOLUTION_CHAIN = [
  'PHILOSOPHY',
  'DAYONE',
  'EVOLVE',
  'EARN',
  'MEMORY',
  'INHERIT',
  'SIMULATE',
  'COMPOUND',
] as const;

export const campusEvolutionEngineStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<CampusEvolutionSnapshot>>;
} = {
  id: 'campus-evolution-engine',
  label: 'CAMPUS EVOLUTION ENGINE',
  phase: 2,
  enabled: false,
  description: 'LIVING ARCHITECTURAL GROWTH — EARN SPACES · WALK YOUR STORY',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Campus Evolution Engine requires browser context.');
    }
    return { ok: true, data: readCampusEvolutionStore() };
  },
};
