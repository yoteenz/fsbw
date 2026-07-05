import {
  COMPANY_ONBOARDING_INTELLIGENCE_STORAGE_KEY,
  COMPANY_ONBOARDING_INTELLIGENCE_VERSION,
  COI_ONBOARDING_PHILOSOPHY,
} from './constants';
import type {
  CompanyOnboardingIntelligenceStore,
  CompanyOnboardingIntelligenceWorkspaceId,
} from './types';

function emptyStore(): CompanyOnboardingIntelligenceStore {
  return {
    version: COMPANY_ONBOARDING_INTELLIGENCE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: 'COMPANY',
    journeyType: 'existing-company',
    onboardingPhase: 'discovery',
    dashboard: {
      summary: 'COMPANY ONBOARDING INTELLIGENCE V1.0 — discover the story · welcome to headquarters.',
      confidenceScorePct: 0,
      journeyLabel: 'EXISTING COMPANY',
      discoveriesCount: 0,
      recommendationsCount: 0,
      campusReady: false,
      arrivalReady: false,
    },
    onboardingPhilosophy: [...COI_ONBOARDING_PHILOSOPHY],
    onboardingJourneys: [],
    organizationalInterviews: [],
    organizationalDiscoveries: [],
    onboardingRecommendations: [],
    organizationBlueprint: [],
    campusGeneration: [],
    organizationalConfidence: {
      overallScorePct: 0,
      knowledgeCompletenessPct: 0,
      recommendedInterviews: [],
      recommendedUploads: [],
      recommendedIntegrations: [],
      recommendedTraining: [],
    },
    chiefOfStaffWelcome: {
      headline: 'Welcome.',
      message: [],
      arrivalNote: '',
    },
    founderWalk: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readCompanyOnboardingIntelligenceStore(): CompanyOnboardingIntelligenceStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(COMPANY_ONBOARDING_INTELLIGENCE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as CompanyOnboardingIntelligenceStore;
    return { ...emptyStore(), ...parsed };
  } catch {
    return emptyStore();
  }
}

export function writeCompanyOnboardingIntelligenceStore(store: CompanyOnboardingIntelligenceStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    COMPANY_ONBOARDING_INTELLIGENCE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString() })
  );
}

export function bootstrapCompanyOnboardingIntelligenceStore(
  seed?: Partial<CompanyOnboardingIntelligenceStore>
): void {
  const existing = readCompanyOnboardingIntelligenceStore();
  if (existing.onboardingJourneys.length > 0 && !seed) return;
  writeCompanyOnboardingIntelligenceStore({ ...emptyStore(), ...seed });
}

export function selectCompanyOnboardingIntelligenceWorkspace(
  id: CompanyOnboardingIntelligenceWorkspaceId
): void {
  const store = readCompanyOnboardingIntelligenceStore();
  writeCompanyOnboardingIntelligenceStore({ ...store, activeWorkspaceId: id });
}
