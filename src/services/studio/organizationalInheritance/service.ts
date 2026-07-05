import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readOrganizationalInheritanceStore } from '../../../studio-os-core/organizational-inheritance/store';

export type OrganizationalInheritanceSnapshot = ReturnType<typeof readOrganizationalInheritanceStore>;

export const ORGANIZATIONAL_INHERITANCE_CHAIN = [
  'STUDIO OS',
  'ORGANIZATIONAL INHERITANCE',
  'INHERITABLE GENETICS',
  'NEW COMPANY',
  'INDEPENDENT EVOLUTION',
] as const;

export const organizationalInheritanceStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<OrganizationalInheritanceSnapshot>>;
} = {
  id: 'organizational-inheritance',
  label: 'ORGANIZATIONAL INHERITANCE',
  phase: 2,
  enabled: false,
  description: 'INHERIT ORGANIZATIONAL GENETICS — PLAYBOOKS · DNA · EXECUTIVES · KNOWLEDGE · EVOLUTION',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Organizational Inheritance requires browser context.');
    }
    return { ok: true, data: readOrganizationalInheritanceStore() };
  },
};
