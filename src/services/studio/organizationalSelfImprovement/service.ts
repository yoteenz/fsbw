import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readOrganizationalSelfImprovementStore } from '../../../studio-os-core/organizational-self-improvement/store';

export type OrganizationalSelfImprovementSnapshot = ReturnType<typeof readOrganizationalSelfImprovementStore>;

export const ORGANIZATIONAL_SELF_IMPROVEMENT_CHAIN = [
  'PHILOSOPHY',
  'REFLECT',
  'IMPROVE',
  'EXPERIMENT',
  'LEARN',
  'MATURITY',
  'EVOLVE',
] as const;

export const organizationalSelfImprovementStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<OrganizationalSelfImprovementSnapshot>>;
} = {
  id: 'organizational-self-improvement',
  label: 'ORGANIZATIONAL SELF-IMPROVEMENT',
  phase: 2,
  enabled: false,
  description: 'CONTINUOUS ORGANIZATIONAL EVOLUTION · LEARNING COMPOUNDS · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Organizational Self-Improvement requires browser context.');
    }
    return { ok: true, data: readOrganizationalSelfImprovementStore() };
  },
};
