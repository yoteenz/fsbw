import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readOrganizationalIntelligenceStore } from '../../../studio-os-core/organizational-intelligence/store';

export type OrganizationalIntelligenceSnapshot = ReturnType<typeof readOrganizationalIntelligenceStore>;

export const ORGANIZATIONAL_INTELLIGENCE_CHAIN = [
  'PHILOSOPHY',
  'LEARN',
  'REASON',
  'DECIDE',
  'REFLECT',
  'WISDOM',
  'FORECAST',
  'COMPOUND',
] as const;

export const organizationalIntelligenceStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<OrganizationalIntelligenceSnapshot>>;
} = {
  id: 'organizational-intelligence',
  label: 'ORGANIZATIONAL INTELLIGENCE',
  phase: 2,
  enabled: false,
  description: 'COLLECTIVE MIND OF THE COMPANY · ACCUMULATED WISDOM · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Organizational Intelligence requires browser context.');
    }
    return { ok: true, data: readOrganizationalIntelligenceStore() };
  },
};
