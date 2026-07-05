/** Company Maturity Engine V1.0 — universal onboarding & organizational understanding (Milestone 52). */

export type CompanyMaturityWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'custom';

export type OnboardingPath = 'build-new' | 'import-existing';

export type CompanyStageId =
  | 'idea'
  | 'registered'
  | 'early-startup'
  | 'operating'
  | 'growing'
  | 'established'
  | 'enterprise';

export type MaturityDomainId =
  | 'business'
  | 'leadership'
  | 'strategy'
  | 'branding'
  | 'customer-experience'
  | 'digital-experience'
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'finance'
  | 'legal'
  | 'human-resources'
  | 'technology'
  | 'knowledge'
  | 'automation'
  | 'analytics'
  | 'community'
  | 'relationships'
  | 'commerce'
  | 'creator-ecosystem'
  | 'organizational-intelligence';

export type DomainMaturityScore = {
  domain: MaturityDomainId;
  label: string;
  scorePct: number;
  confidencePct: number;
  strength: string;
  weakness: string;
  recommendation: string;
  growthOpportunity: string;
};

export type ExistingAssetItem = {
  id: string;
  category: string;
  label: string;
  status: 'present' | 'partial' | 'missing' | 'planned';
  notes: string;
};

export type IntegrationReadiness = {
  id: string;
  platform: string;
  category: string;
  status: 'architecture-ready' | 'planned' | 'connected';
  purpose: string;
};

export type OrganizationalDiagnostic = {
  strengths: string[];
  risks: string[];
  knowledgeGaps: string[];
  missingSystems: string[];
  duplicateSystems: string[];
  bottlenecks: string[];
  growthConstraints: string[];
  automationOpportunities: string[];
  leadershipOpportunities: string[];
  futureRecommendations: string[];
};

export type ArchitectRecommendation = {
  id: string;
  architect: string;
  action: 'recommended' | 'skip' | 'optimize';
  rationale: string;
  maturityTrigger: string;
  confidencePct: number;
};

export type RoadmapMilestone = {
  id: string;
  title: string;
  sequence: number;
  effort: 'low' | 'medium' | 'high';
  impact: string;
  dependencies: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidencePct: number;
};

export type TimelineEvent = {
  id: string;
  date: string;
  label: string;
  type: 'founding' | 'milestone' | 'rebrand' | 'launch' | 'product' | 'leadership' | 'growth' | 'future';
};

export type MaturitySimulation = {
  id: string;
  label: string;
  path: string;
  maturityImprovementPct: number;
  organizationalImpact: string;
  effort: string;
  resources: string;
  risks: string[];
  confidencePct: number;
};

export type CosMaturityAlert = {
  id: string;
  domain: string;
  trend: 'increasing' | 'declining' | 'improving' | 'plateauing';
  message: string;
  recommendation: string;
};

export type CompanyMaturityEngineStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: CompanyMaturityWorkspaceId;
  dashboard: {
    summary: string;
    overallMaturityPct: number;
    assessmentConfidencePct: number;
    domainsAssessed: number;
    roadmapItems: number;
    organizationalHealthPct: number;
  };
  maturityPhilosophy: string[];
  onboardingPath: OnboardingPath;
  companyStage: CompanyStageId;
  companyName: string;
  domainScores: DomainMaturityScore[];
  existingAssets: ExistingAssetItem[];
  integrations: IntegrationReadiness[];
  diagnostic: OrganizationalDiagnostic;
  architectRecs: ArchitectRecommendation[];
  roadmap: RoadmapMilestone[];
  timeline: TimelineEvent[];
  simulations: MaturitySimulation[];
  cosAlerts: CosMaturityAlert[];
  historicalProgress: { date: string; overallPct: number }[];
  futureProjections: string[];
};
