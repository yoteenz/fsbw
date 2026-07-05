/** Founder Walk V1.0 — emotional spine of the campus (Milestone 59.5). */

export type FounderWalkWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type TimelineEra = 'day-one' | 'year-one' | 'year-five' | 'year-ten' | 'year-twenty' | 'future';

export type PathwayMilestone = {
  id: string;
  category: string;
  title: string;
  date: string;
  architecturalMemory: string;
  memoryType: 'sculpture' | 'tree' | 'garden' | 'bridge' | 'inscription' | 'pavilion' | 'courtyard' | 'installation';
};

export type MemoryMarker = {
  id: string;
  milestoneId: string;
  whyItMattered: string;
  whatWasLearned: string;
  whoMadeItPossible: string;
  whatAlmostWentWrong?: string;
  whatChangedAfter: string;
  futureAdvice: string;
};

export type ReflectionSpace = {
  id: string;
  label: string;
  purpose: string;
  locationOnPath: string;
};

export type LivingLandscapeChange = {
  id: string;
  element: string;
  evolution: string;
  season?: string;
};

export type OrganizationalConnection = {
  id: string;
  memoryId: string;
  connectedSystem: string;
  connection: string;
};

export type FutureGenerationInsight = {
  id: string;
  category: string;
  insight: string;
};

export type FamilyLegacyMoment = {
  id: string;
  title: string;
  note: string;
  visibility: 'private' | 'shared';
};

export type PortfolioLegacyLink = {
  id: string;
  fromCompany: string;
  toCompany: string;
  influence: string;
};

export type MemoryIntelligenceRec = {
  id: string;
  signal: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
};

export type CampusIntegrationPoint = {
  id: string;
  campusLocation: string;
  connection: string;
};

export type FounderWalkStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: FounderWalkWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    pathLengthMilestones: number;
    reflectionSpaces: number;
    preservedMemories: number;
    activeTimelineEra: TimelineEra;
    landscapeMaturityPct: number;
    legacyDepthPct: number;
  };
  walkPhilosophy: string[];
  dayOnePath: {
    description: string;
    atmosphere: string;
  };
  pathwayMilestones: PathwayMilestone[];
  memoryMarkers: MemoryMarker[];
  reflectionSpaces: ReflectionSpace[];
  livingLandscape: LivingLandscapeChange[];
  organizationalConnections: OrganizationalConnection[];
  futureGenerations: FutureGenerationInsight[];
  familyLegacy: FamilyLegacyMoment[];
  portfolioLegacy: PortfolioLegacyLink[];
  memoryIntelligence: MemoryIntelligenceRec[];
  campusIntegration: CampusIntegrationPoint[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
