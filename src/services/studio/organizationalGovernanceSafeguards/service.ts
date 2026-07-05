import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readOrganizationalGovernanceSafeguardsStore } from '../../../studio-os-core/organizational-governance-safeguards/store';

export type OrganizationalGovernanceSafeguardsSnapshot = ReturnType<typeof readOrganizationalGovernanceSafeguardsStore>;

export const ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_CHAIN = [
  'CONSTITUTION',
  'POLICIES',
  'SAFEGUARDS',
  'ETHICS',
  'RISK',
  'STEWARDSHIP',
  'TRUST',
] as const;

export const organizationalGovernanceSafeguardsStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<OrganizationalGovernanceSafeguardsSnapshot>>;
} = {
  id: 'organizational-governance-safeguards',
  label: 'ORGANIZATIONAL GOVERNANCE & SAFEGUARDS',
  phase: 2,
  enabled: false,
  description: 'CONSTITUTIONAL STEWARDSHIP · INVISIBLE SAFEGUARDS · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Organizational Governance & Safeguards requires browser context.');
    }
    return { ok: true, data: readOrganizationalGovernanceSafeguardsStore() };
  },
};
