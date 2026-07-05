import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readOrganizationalApprenticeshipStore } from '../../../studio-os-core/organizational-apprenticeship/store';

export type OrganizationalApprenticeshipSnapshot = ReturnType<typeof readOrganizationalApprenticeshipStore>;

export const ORGANIZATIONAL_APPRENTICESHIP_CHAIN = [
  'OBSERVE',
  'UNDERSTAND',
  'CALIBRATE',
  'PRACTICE',
  'TRUST',
  'MENTOR',
  'GRADUATE',
  'STEWARD',
] as const;

export const organizationalApprenticeshipStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<OrganizationalApprenticeshipSnapshot>>;
} = {
  id: 'organizational-apprenticeship',
  label: 'ORGANIZATIONAL APPRENTICESHIP',
  phase: 2,
  enabled: false,
  description: 'PERMANENT LEARNING & TRUST-BUILDING · STEWARDSHIP · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Organizational Apprenticeship requires browser context.');
    }
    return { ok: true, data: readOrganizationalApprenticeshipStore() };
  },
};
