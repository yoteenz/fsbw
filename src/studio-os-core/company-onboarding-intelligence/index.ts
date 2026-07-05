export { bootstrapCompanyOnboardingIntelligencePlatform, buildCompanyOnboardingIntelligenceSeed } from './bootstrap';
export {
  COMPANY_ONBOARDING_INTELLIGENCE_ID,
  COMPANY_ONBOARDING_INTELLIGENCE_STORAGE_KEY,
  COMPANY_ONBOARDING_INTELLIGENCE_VERSION,
  COI_CONNECTED_SYSTEMS,
  COI_ONBOARDING_PHILOSOPHY,
} from './constants';
export {
  bootstrapCompanyOnboardingIntelligenceStore,
  readCompanyOnboardingIntelligenceStore,
  selectCompanyOnboardingIntelligenceWorkspace,
  writeCompanyOnboardingIntelligenceStore,
} from './store';
export type {
  CampusGeneration,
  ChiefOfStaffWelcome,
  CompanyOnboardingIntelligenceStore,
  CompanyOnboardingIntelligenceWorkspaceId,
  FounderWalkStep,
  OnboardingJourney,
  OnboardingJourneyType,
  OnboardingRecommendation,
  OrganizationBlueprint,
  OrganizationalConfidence,
  OrganizationalDiscovery,
  OrganizationalInterview,
} from './types';
