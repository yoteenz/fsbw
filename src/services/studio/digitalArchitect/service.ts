import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readDigitalArchitectStore } from '../../../studio-os-core/digital-architect/store';

export type DigitalArchitectSnapshot = ReturnType<typeof readDigitalArchitectStore>;

export const DIGITAL_ARCHITECT_CHAIN = [
  'PHILOSOPHY',
  'GALLERY',
  'RECOMMEND',
  'ARCHITECT',
  'DESIGN SYSTEM',
  'SIMULATE',
  'PLAN',
  'HANDOFF',
] as const;

export const digitalArchitectStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<DigitalArchitectSnapshot>>;
} = {
  id: 'digital-architect',
  label: 'DIGITAL ARCHITECT',
  phase: 2,
  enabled: false,
  description: 'DIGITAL SOLUTION ARCHITECT — EXPERIENCE GALLERY · ECOSYSTEM DESIGN · LAUNCH HANDOFF',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Digital Architect requires browser context.');
    }
    return { ok: true, data: readDigitalArchitectStore() };
  },
};
