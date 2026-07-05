import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readCompanyOnboardingIntelligenceStore } from '../../../studio-os-core/company-onboarding-intelligence/store';

export type CompanyOnboardingIntelligenceSnapshot = ReturnType<typeof readCompanyOnboardingIntelligenceStore>;

export const COMPANY_ONBOARDING_INTELLIGENCE_CHAIN = [
  'DISCOVERY',
  'INTERVIEW',
  'BLUEPRINT',
  'CAMPUS',
  'ARRIVAL',
  'WELCOME',
  'UNDERSTANDING',
] as const;

export const companyOnboardingIntelligenceStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<CompanyOnboardingIntelligenceSnapshot>>;
} = {
  id: 'company-onboarding-intelligence',
  label: 'COMPANY ONBOARDING INTELLIGENCE',
  phase: 2,
  enabled: false,
  description: 'INTELLIGENT ONBOARDING · ORGANIZATIONAL WELCOME · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Company Onboarding Intelligence requires browser context.');
    }
    return { ok: true, data: readCompanyOnboardingIntelligenceStore() };
  },
};
