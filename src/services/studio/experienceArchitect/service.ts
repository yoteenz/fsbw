import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readExperienceArchitectStore } from '../../../studio-os-core/experience-architect/store';

export type ExperienceArchitectSnapshot = ReturnType<typeof readExperienceArchitectStore>;

export const EXPERIENCE_ARCHITECT_CHAIN = [
  'PHILOSOPHY',
  'BLUEPRINT',
  'JOURNEY MAP',
  'EMOTIONAL',
  'SYSTEMS',
  'SIMULATE',
  'APPROVE',
  'HANDOFF',
] as const;

export const experienceArchitectStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ExperienceArchitectSnapshot>>;
} = {
  id: 'experience-architect',
  label: 'EXPERIENCE ARCHITECT',
  phase: 2,
  enabled: false,
  description: 'EMOTIONAL DESIGN — EVERY TOUCHPOINT · MEMORABILITY · DIGITAL ARCHITECT HANDOFF',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Experience Architect requires browser context.');
    }
    return { ok: true, data: readExperienceArchitectStore() };
  },
};
