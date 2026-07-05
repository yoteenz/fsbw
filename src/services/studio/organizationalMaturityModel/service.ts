import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readOrganizationalMaturityModelStore } from '../../../studio-os-core/organizational-maturity-model/store';

export type OrganizationalMaturityModelSnapshot = ReturnType<typeof readOrganizationalMaturityModelStore>;

export const ORGANIZATIONAL_MATURITY_MODEL_CHAIN = [
  'STAGES',
  'READINESS',
  'EXECUTIVES',
  'AUTONOMY',
  'CAMPUS',
  'ROADMAP',
  'MATURITY',
] as const;

export const organizationalMaturityModelStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<OrganizationalMaturityModelSnapshot>>;
} = {
  id: 'organizational-maturity-model',
  label: 'ORGANIZATIONAL MATURITY MODEL',
  phase: 2,
  enabled: false,
  description: 'MASTER PROGRESSION SYSTEM · READINESS BEFORE ADVANCEMENT · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Organizational Maturity Model requires browser context.');
    }
    return { ok: true, data: readOrganizationalMaturityModelStore() };
  },
};
