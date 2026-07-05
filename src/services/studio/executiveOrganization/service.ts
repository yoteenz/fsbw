import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readExecutiveOrganizationStore } from '../../../studio-os-core/executive-organization/store';

export type ExecutiveOrganizationSnapshot = ReturnType<typeof readExecutiveOrganizationStore>;

export const EXECUTIVE_ORGANIZATION_INHERITANCE_CHAIN = [
  'FOUNDER',
  'CHIEF OF STAFF',
  'EXECUTIVE LEADERSHIP',
  'DEPARTMENTS',
  'TEAMS',
  'WORKERS',
  'INSTITUTIONAL KNOWLEDGE',
] as const;

export const executiveOrganizationStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ExecutiveOrganizationSnapshot>>;
} = {
  id: 'executive-organization',
  label: 'EXECUTIVE ORGANIZATION',
  phase: 2,
  enabled: false,
  description: 'LIVING LEADERSHIP TEAM — EXECUTIVE HQ · DEPARTMENTS · TEAMS · WORKERS · CULTURE',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Executive Organization requires browser context.');
    }
    return { ok: true, data: readExecutiveOrganizationStore() };
  },
};
