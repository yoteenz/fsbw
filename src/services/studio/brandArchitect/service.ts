import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readBrandArchitectStore } from '../../../studio-os-core/brand-architect/store';

export type BrandArchitectSnapshot = ReturnType<typeof readBrandArchitectStore>;

export const BRAND_ARCHITECT_CHAIN = [
  'PHILOSOPHY',
  'BLUEPRINT',
  'VERBAL',
  'VISUAL',
  'SYSTEMS',
  'SIMULATE',
  'APPROVE',
  'HANDOFF',
] as const;

export const brandArchitectStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<BrandArchitectSnapshot>>;
} = {
  id: 'brand-architect',
  label: 'BRAND ARCHITECT',
  phase: 2,
  enabled: false,
  description: 'COHESIVE BRAND SYSTEMS — MEANING BEFORE COLORS · EXPERIENCE ARCHITECT HANDOFF',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Brand Architect requires browser context.');
    }
    return { ok: true, data: readBrandArchitectStore() };
  },
};
