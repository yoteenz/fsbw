import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readArchitectStudioStore } from '../../../studio-os-core/architect-studio/store';

export type ArchitectStudioSnapshot = ReturnType<typeof readArchitectStudioStore>;

export const ARCHITECT_STUDIO_CHAIN = [
  'PHILOSOPHY',
  'IMMERSIVE',
  'STUDIOS',
  'FORUM',
  'EVOLVE',
  'INNOVATE',
  'COLLABORATE',
  'COMPOUND',
] as const;

export const architectStudioStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ArchitectStudioSnapshot>>;
} = {
  id: 'architect-studio',
  label: 'ARCHITECT STUDIO',
  phase: 2,
  enabled: false,
  description: 'IMMERSIVE INNOVATION HEADQUARTERS — FIVE STUDIOS · ONE CAMPUS',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Architect Studio requires browser context.');
    }
    return { ok: true, data: readArchitectStudioStore() };
  },
};
