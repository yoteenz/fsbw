/** Campus Evolution Engine V1.0 — living architectural growth (Milestone 59). */

export type CampusEvolutionWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type CampusStageId =
  | 'startup-studio'
  | 'innovation-loft'
  | 'creative-headquarters'
  | 'executive-headquarters'
  | 'innovation-campus'
  | 'global-campus'
  | 'organizational-institute'
  | 'legacy-campus';

export type DayOneSpace = {
  id: string;
  label: string;
  purpose: string;
};

export type OrganicEvolutionTrigger = {
  id: string;
  category: string;
  achievement: string;
  architecturalImpact: string;
  earnedAt: string;
};

export type CampusStage = {
  id: CampusStageId;
  label: string;
  description: string;
  current: boolean;
  progressPct: number;
};

export type EarnedSpace = {
  id: string;
  label: string;
  earnedBecause: string;
  status: 'active' | 'under-construction' | 'planned';
};

export type CompanyMemoryMilestone = {
  id: string;
  category: string;
  title: string;
  date: string;
  architecturalMemorial: string;
};

export type LivingMuseumGallery = {
  id: string;
  name: string;
  contents: string;
};

export type BrandInheritance = {
  companyName: string;
  identity: string;
  materials: string;
  colors: string;
  architecture: string;
  motionLanguage: string;
  lighting: string;
  uniqueness: string;
};

export type CultureProfile = {
  profile: string;
  influences: string[];
  expression: string;
};

export type PortfolioDistrict = {
  id: string;
  label: string;
  sharedBy: string[];
  purpose: string;
};

export type CampusIntelligenceRec = {
  id: string;
  category: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export type LivingEnvironmentEvent = {
  id: string;
  eventType: string;
  label: string;
  status: 'active' | 'planned' | 'complete';
};

export type ArchitecturalSimulation = {
  id: string;
  horizon: string;
  scenario: string;
  campusPreview: string;
  shapedBy: string;
};

export type CampusEvolutionStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: CampusEvolutionWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    currentStageId: CampusStageId;
    stageProgressPct: number;
    organizationalHealthPct: number;
    knowledgeGrowthPct: number;
    relationshipGrowthPct: number;
    innovationPct: number;
    activeConstruction: number;
    futureExpansionPct: number;
  };
  campusPhilosophy: string[];
  dayOneSpaces: DayOneSpace[];
  stages: CampusStage[];
  organicEvolution: OrganicEvolutionTrigger[];
  earnedSpaces: EarnedSpace[];
  companyMemory: CompanyMemoryMilestone[];
  livingMuseum: LivingMuseumGallery[];
  brandInheritance: BrandInheritance;
  cultureProfile: CultureProfile;
  portfolioDistricts: PortfolioDistrict[];
  campusIntelligence: CampusIntelligenceRec[];
  livingEnvironment: LivingEnvironmentEvent[];
  simulations: ArchitecturalSimulation[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
