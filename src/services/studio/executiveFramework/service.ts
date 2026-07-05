import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readExecutiveFrameworkStore } from '../../../studio-os-core/executive-framework/store';

export type ExecutiveFrameworkSnapshot = ReturnType<typeof readExecutiveFrameworkStore>;

export const EXECUTIVE_FRAMEWORK_CHAIN = [
  'PHILOSOPHY',
  'IDENTITY',
  'STANDARDS',
  'DECIDE',
  'COLLABORATE',
  'MEMORY',
  'WORKSPACE',
  'ACCOUNT',
  'COMPOUND',
] as const;

export const executiveFrameworkStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ExecutiveFrameworkSnapshot>>;
} = {
  id: 'executive-framework',
  label: 'EXECUTIVE FRAMEWORK',
  phase: 2,
  enabled: false,
  description: 'CONSTITUTIONAL FOUNDATION FOR EVERY AI EXECUTIVE — EXTRAORDINARY LEADERSHIP',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Executive Framework requires browser context.');
    }
    return { ok: true, data: readExecutiveFrameworkStore() };
  },
};
