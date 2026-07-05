import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readOrganizationalDelegationStore } from '../../../studio-os-core/organizational-delegation-engine/store';

export type OrganizationalDelegationSnapshot = ReturnType<typeof readOrganizationalDelegationStore>;

export const ORGANIZATIONAL_DELEGATION_ENGINE_CHAIN = [
  'PHILOSOPHY',
  'OUTCOMES',
  'ASSIGN',
  'EXECUTE',
  'GOVERN',
  'LEARN',
  'LEAD',
] as const;

export const organizationalDelegationEngineStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<OrganizationalDelegationSnapshot>>;
} = {
  id: 'organizational-delegation-engine',
  label: 'ORGANIZATIONAL DELEGATION ENGINE',
  phase: 2,
  enabled: false,
  description: 'OUTCOME-BASED DELEGATION · FOUNDERS DEFINE OUTCOMES · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Organizational Delegation Engine requires browser context.');
    }
    return { ok: true, data: readOrganizationalDelegationStore() };
  },
};
