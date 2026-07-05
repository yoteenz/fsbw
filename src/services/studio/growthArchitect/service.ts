import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readGrowthArchitectStore } from '../../../studio-os-core/growth-architect/store';

export type GrowthArchitectSnapshot = ReturnType<typeof readGrowthArchitectStore>;

export const GROWTH_ARCHITECT_CHAIN = [
  'PHILOSOPHY',
  'BLUEPRINT',
  'LIFECYCLE',
  'INITIATIVES',
  'GTM',
  'SIMULATE',
  'ORCHESTRATE',
  'COMPOUND',
] as const;

export const growthArchitectStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<GrowthArchitectSnapshot>>;
} = {
  id: 'growth-architect',
  label: 'GROWTH ARCHITECT',
  phase: 2,
  enabled: false,
  description: 'SUSTAINABLE GROWTH OS — INITIATIVES · GTM · ORCHESTRATION · COMPOUND VALUE',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Growth Architect requires browser context.');
    }
    return { ok: true, data: readGrowthArchitectStore() };
  },
};
