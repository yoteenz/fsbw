import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readCompanyMaturityEngineStore } from '../../../studio-os-core/company-maturity-engine/store';

export type CompanyMaturityEngineSnapshot = ReturnType<typeof readCompanyMaturityEngineStore>;

export const COMPANY_MATURITY_ENGINE_CHAIN = [
  'UNDERSTAND',
  'ASSESS',
  'DIAGNOSE',
  'RECOMMEND',
  'ROADMAP',
  'SIMULATE',
  'EVOLVE',
] as const;

export const companyMaturityEngineStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<CompanyMaturityEngineSnapshot>>;
} = {
  id: 'company-maturity-engine',
  label: 'COMPANY MATURITY ENGINE',
  phase: 2,
  enabled: false,
  description: 'UNIVERSAL ONBOARDING — MATURITY ASSESSMENT · ROADMAP · ORGANIZATIONAL UNDERSTANDING',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Company Maturity Engine requires browser context.');
    }
    return { ok: true, data: readCompanyMaturityEngineStore() };
  },
};
