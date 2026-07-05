/** Company Onboarding Intelligence V1.0 — intelligent organizational welcome (Milestone 73.5). */

export type CompanyOnboardingIntelligenceWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type OnboardingJourneyType = 'new-company' | 'existing-company';

export type OnboardingJourney = {
  id: OnboardingJourneyType;
  label: string;
  description: string;
  steps: string[];
  active: boolean;
};

export type OrganizationalInterview = {
  id: string;
  question: string;
  response?: string;
  status: 'answered' | 'pending' | 'recommended';
};

export type OrganizationalDiscovery = {
  id: string;
  category: string;
  finding: string;
  confidence: number;
};

export type OnboardingRecommendation = {
  id: string;
  category: string;
  recommendation: string;
  why: string;
  value: string;
  outcome: string;
};

export type OrganizationBlueprint = {
  id: string;
  section: string;
  content: string;
  status: 'generated' | 'evolving' | 'foundational';
};

export type CampusGeneration = {
  id: string;
  element: string;
  adaptation: string;
  feeling: string;
};

export type OrganizationalConfidence = {
  overallScorePct: number;
  knowledgeCompletenessPct: number;
  recommendedInterviews: string[];
  recommendedUploads: string[];
  recommendedIntegrations: string[];
  recommendedTraining: string[];
};

export type ChiefOfStaffWelcome = {
  headline: string;
  message: string[];
  arrivalNote: string;
};

export type FounderWalkStep = {
  id: string;
  stop: string;
  introduction: string;
  order: number;
};

export type CompanyOnboardingIntelligenceStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: CompanyOnboardingIntelligenceWorkspaceId;
  companyName: string;
  journeyType: OnboardingJourneyType;
  onboardingPhase: 'discovery' | 'interview' | 'blueprint' | 'campus' | 'arrival' | 'complete';
  dashboard: {
    summary: string;
    confidenceScorePct: number;
    journeyLabel: string;
    discoveriesCount: number;
    recommendationsCount: number;
    campusReady: boolean;
    arrivalReady: boolean;
  };
  onboardingPhilosophy: string[];
  onboardingJourneys: OnboardingJourney[];
  organizationalInterviews: OrganizationalInterview[];
  organizationalDiscoveries: OrganizationalDiscovery[];
  onboardingRecommendations: OnboardingRecommendation[];
  organizationBlueprint: OrganizationBlueprint[];
  campusGeneration: CampusGeneration[];
  organizationalConfidence: OrganizationalConfidence;
  chiefOfStaffWelcome: ChiefOfStaffWelcome;
  founderWalk: FounderWalkStep[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
