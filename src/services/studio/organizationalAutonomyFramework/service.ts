import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readOrganizationalAutonomyStore } from '../../../studio-os-core/organizational-autonomy-framework/store';

export type OrganizationalAutonomySnapshot = ReturnType<typeof readOrganizationalAutonomyStore>;

export const ORGANIZATIONAL_AUTONOMY_FRAMEWORK_CHAIN = [
  'PHILOSOPHY',
  'LEVELS',
  'GOVERN',
  'TRUST',
  'EXECUTE',
  'TRANSPARENCY',
  'LEARN',
] as const;

export const organizationalAutonomyFrameworkStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<OrganizationalAutonomySnapshot>>;
} = {
  id: 'organizational-autonomy-framework',
  label: 'ORGANIZATIONAL AUTONOMY FRAMEWORK',
  phase: 2,
  enabled: false,
  description: 'CONSTITUTIONAL AUTONOMY GOVERNANCE · TRUSTED STEWARDSHIP · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Organizational Autonomy Framework requires browser context.');
    }
    return { ok: true, data: readOrganizationalAutonomyStore() };
  },
};
